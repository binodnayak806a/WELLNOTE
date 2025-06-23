import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Types for better type safety
interface ServiceResult<T = any> {
  data?: T
  error?: string
  success: boolean
}

// Create tenant-aware query builder instance
const createTenantQuery = (hospitalId?: string) => {
  if (!hospitalId) {
    throw new Error('Hospital ID is required for tenant operations')
  }
  
  return {
    select: (table: string) => {
      return supabase.from(table).select('*').eq('hospital_id', hospitalId)
    },
    insert: (table: string, data: any) => {
      const insertData = Array.isArray(data) 
        ? data.map(item => ({ ...item, hospital_id: hospitalId }))
        : { ...data, hospital_id: hospitalId }
      
      return supabase.from(table).insert(insertData)
    },
    update: (table: string, data: any) => {
      return supabase.from(table).update(data).eq('hospital_id', hospitalId)
    },
    delete: (table: string) => {
      return supabase.from(table).delete().eq('hospital_id', hospitalId)
    }
  }
}

// Doctor service for managing doctor profiles and schedules
export const doctorService = {
  // Get all doctors for current hospital
  async getDoctors(hospitalId?: string): Promise<ServiceResult<any[]>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.select('doctors')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            phone,
            avatar_url,
            is_active
          ),
          departments (
            id,
            name,
            code
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Get doctor by ID
  async getDoctorById(id: string, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.select('doctors')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            phone,
            avatar_url,
            is_active
          ),
          departments (
            id,
            name,
            code
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Get doctors by department
  async getDoctorsByDepartment(departmentId: string, hospitalId?: string): Promise<ServiceResult<any[]>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.select('doctors')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Add new doctor
  async addDoctor(doctorData: any, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      // First, create the user account
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: doctorData.user.email,
        password: 'TemporaryPassword123!', // This should be auto-generated or provided
        options: {
          data: {
            full_name: doctorData.user.full_name,
            role: 'doctor',
            hospital_id: hospitalId
          }
        }
      })

      if (userError) {
        return { success: false, error: userError.message }
      }

      if (!userData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create user profile in users table
      const query = createTenantQuery(hospitalId)
      const { error: profileError } = await query.insert('users', {
        id: userData.user.id,
        email: doctorData.user.email,
        full_name: doctorData.user.full_name,
        phone: doctorData.user.phone,
        role: 'doctor',
        department_id: doctorData.department_id
      })

      if (profileError) {
        return { success: false, error: profileError.message }
      }

      // Create doctor profile
      const { data: doctorProfile, error: doctorError } = await query.insert('doctors', {
        user_id: userData.user.id,
        employee_id: doctorData.employee_id,
        department_id: doctorData.department_id,
        personal_info: doctorData.personal_info,
        professional_info: doctorData.professional_info,
        schedule: doctorData.schedule || {},
        consultation_fee: doctorData.consultation_fee,
        is_available: doctorData.is_available,
        is_active: doctorData.is_active
      }).select().single()

      if (doctorError) {
        return { success: false, error: doctorError.message }
      }

      return { success: true, data: doctorProfile }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Update doctor
  async updateDoctor(id: string, doctorData: any, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      
      // If photo is included, upload it to storage
      if (doctorData.photoFile) {
        const fileName = `doctor-photos/${id}/${Date.now()}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('doctor-photos')
          .upload(fileName, doctorData.photoFile)

        if (uploadError) {
          return { success: false, error: uploadError.message }
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('doctor-photos')
          .getPublicUrl(fileName)
        
        // Update photo URL in personal_info
        if (doctorData.personal_info) {
          doctorData.personal_info.photo_url = urlData.publicUrl
        }
      }

      // Update doctor profile
      const { data, error } = await query.update('doctors', {
        ...doctorData,
        updated_at: new Date().toISOString()
      })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Get doctor schedule
  async getDoctorSchedule(doctorId: string, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.select('doctors')
        .select('id, schedule')
        .eq('id', doctorId)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data.schedule }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Update doctor schedule
  async updateDoctorSchedule(doctorId: string, scheduleData: any, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.update('doctors', {
        schedule: scheduleData,
        updated_at: new Date().toISOString()
      })
        .eq('id', doctorId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Get available time slots for a doctor on a specific date
  async getAvailableTimeSlots(doctorId: string, date: string, hospitalId?: string): Promise<ServiceResult<string[]>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      // First, get the doctor's schedule
      const scheduleResult = await this.getDoctorSchedule(doctorId, hospitalId)
      
      if (!scheduleResult.success) {
        return { success: false, error: scheduleResult.error }
      }
      
      const schedule = scheduleResult.data
      
      // Get day of week for the requested date
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
      
      // Check if doctor works on this day
      if (!schedule?.workingDays?.includes(dayOfWeek)) {
        return { success: true, data: [] } // No slots available on non-working days
      }
      
      // Get shifts for this day
      const dayShifts = schedule?.shifts?.[dayOfWeek]
      
      if (!dayShifts) {
        return { success: true, data: [] }
      }
      
      // Get doctor details to determine slot duration
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('professional_info')
        .eq('id', doctorId)
        .eq('hospital_id', hospitalId)
        .single()
      
      if (doctorError) {
        return { success: false, error: doctorError.message }
      }
      
      const slotDuration = doctorData.professional_info?.slot_duration || 15 // Default to 15 minutes
      
      // Generate slots
      const slots: string[] = []
      
      // Generate morning slots
      if (dayShifts.morning?.start && dayShifts.morning?.end) {
        const morningStart = dayShifts.morning.start
        const morningEnd = dayShifts.morning.end
        
        // Generate slots from start to end
        let currentTime = morningStart
        while (currentTime < morningEnd) {
          slots.push(currentTime)
          
          // Add slot duration to current time
          const [hours, minutes] = currentTime.split(':').map(Number)
          const totalMinutes = hours * 60 + minutes + slotDuration
          const newHours = Math.floor(totalMinutes / 60)
          const newMinutes = totalMinutes % 60
          currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
        }
      }
      
      // Generate evening slots
      if (dayShifts.evening?.start && dayShifts.evening?.end) {
        const eveningStart = dayShifts.evening.start
        const eveningEnd = dayShifts.evening.end
        
        // Generate slots from start to end
        let currentTime = eveningStart
        while (currentTime < eveningEnd) {
          slots.push(currentTime)
          
          // Add slot duration to current time
          const [hours, minutes] = currentTime.split(':').map(Number)
          const totalMinutes = hours * 60 + minutes + slotDuration
          const newHours = Math.floor(totalMinutes / 60)
          const newMinutes = totalMinutes % 60
          currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
        }
      }
      
      // Check for breaks
      const dayBreaks = schedule?.breaks?.filter((breakItem: any) => 
        breakItem.days?.includes(dayOfWeek)
      )
      
      // Filter out slots that fall within breaks
      const availableSlots = slots.filter(slot => {
        // Check if slot falls within any break
        return !dayBreaks?.some((breakItem: any) => {
          return slot >= breakItem.start && slot < breakItem.end
        })
      })
      
      // Check for leaves
      const isOnLeave = schedule?.leaves?.some((leave: any) => {
        const leaveStart = new Date(leave.from)
        const leaveEnd = new Date(leave.to)
        const checkDate = new Date(date)
        
        return checkDate >= leaveStart && checkDate <= leaveEnd
      })
      
      if (isOnLeave) {
        return { success: true, data: [] } // No slots available when on leave
      }
      
      // Check for existing appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctorId)
        .eq('hospital_id', hospitalId)
        .eq('appointment_date', date)
        .in('status', ['scheduled', 'confirmed', 'in_progress'])
      
      if (appointmentsError) {
        return { success: false, error: appointmentsError.message }
      }
      
      // Filter out slots that already have appointments
      const bookedSlots = appointments?.map((apt: any) => apt.appointment_time.substring(0, 5)) || []
      
      const finalAvailableSlots = availableSlots.filter(slot => !bookedSlots.includes(slot))
      
      return { success: true, data: finalAvailableSlots }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Upload doctor credentials
  async uploadCredentials(doctorId: string, credentials: any[], hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      // Get current doctor data
      const doctorResult = await this.getDoctorById(doctorId, hospitalId)
      
      if (!doctorResult.success) {
        return { success: false, error: doctorResult.error }
      }
      
      const doctor = doctorResult.data
      
      // Upload each credential file
      const uploadedCredentials = []
      
      for (const credential of credentials) {
        if (credential.file) {
          const fileName = `doctor-credentials/${doctorId}/${uuidv4()}-${credential.name}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('doctor-credentials')
            .upload(fileName, credential.file)
          
          if (uploadError) {
            return { success: false, error: `Failed to upload ${credential.name}: ${uploadError.message}` }
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('doctor-credentials')
            .getPublicUrl(fileName)
          
          uploadedCredentials.push({
            ...credential,
            file: null, // Remove file object
            fileUrl: urlData.publicUrl,
            uploadedAt: new Date().toISOString()
          })
        } else {
          // Keep existing credential without file
          uploadedCredentials.push(credential)
        }
      }
      
      // Update doctor profile with credentials
      const professionalInfo = {
        ...doctor.professional_info,
        credentials: uploadedCredentials
      }
      
      const updateResult = await this.updateDoctor(
        doctorId,
        { professional_info: professionalInfo },
        hospitalId
      )
      
      return updateResult
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Setup multi-factor authentication
  async setupMfa(doctorId: string, mfaType: string, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      // Get current doctor data
      const doctorResult = await this.getDoctorById(doctorId, hospitalId)
      
      if (!doctorResult.success) {
        return { success: false, error: doctorResult.error }
      }
      
      const doctor = doctorResult.data
      
      // Update doctor profile with MFA settings
      const personalInfo = {
        ...doctor.personal_info,
        mfa: {
          enabled: true,
          type: mfaType,
          setupDate: new Date().toISOString()
        }
      }
      
      const updateResult = await this.updateDoctor(
        doctorId,
        { personal_info: personalInfo },
        hospitalId
      )
      
      return updateResult
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

// Department service for managing departments
export const departmentService = {
  // Get all departments for current hospital
  async getDepartments(hospitalId?: string): Promise<ServiceResult<any[]>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.select('departments')
        .order('name', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Get department by ID
  async getDepartmentById(id: string, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.select('departments')
        .eq('id', id)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Add new department
  async addDepartment(departmentData: any, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.insert('departments', {
        ...departmentData,
        is_active: true
      }).select().single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // Update department
  async updateDepartment(id: string, departmentData: any, hospitalId?: string): Promise<ServiceResult<any>> {
    try {
      if (!hospitalId) {
        return { success: false, error: 'Hospital ID is required' }
      }
      
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.update('departments', {
        ...departmentData,
        updated_at: new Date().toISOString()
      })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export default doctorService