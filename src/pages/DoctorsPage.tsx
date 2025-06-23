import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw,
  Loader2,
  Building2,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { doctorService, departmentService } from '@/services/doctorService'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import DoctorRegistrationForm from '@/components/doctors/DoctorRegistrationForm'
import DoctorProfileView from '@/components/doctors/DoctorProfileView'
import DoctorScheduleForm from '@/components/doctors/DoctorScheduleForm'
import DoctorList from '@/components/doctors/DoctorList'
import DoctorCredentialsUpload from '@/components/doctors/DoctorCredentialsUpload'
import DoctorMultiFactorAuth from '@/components/doctors/DoctorMultiFactorAuth'
import DoctorAvailabilityCalendar from '@/components/doctors/DoctorAvailabilityCalendar'

// Types
interface Doctor {
  id: string
  employee_id: string
  user_id: string
  department_id: string
  personal_info: any
  professional_info: any
  schedule: any
  consultation_fee: number
  is_available: boolean
  is_active: boolean
  users: {
    full_name: string
    email: string
    phone: string
    avatar_url: string | null
  }
  departments: {
    name: string
    code: string
  }
}

interface Department {
  id: string
  name: string
  code: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false)
  const [isMfaDialogOpen, setIsMfaDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')

  const { hospitalId } = useAuth()
  const navigate = useNavigate()
  const { doctorId } = useParams()

  // Load doctors and departments
  useEffect(() => {
    if (hospitalId) {
      loadDoctors()
      loadDepartments()
    }
  }, [hospitalId])

  // If doctorId is provided in URL, load and select that doctor
  useEffect(() => {
    if (doctorId && hospitalId) {
      loadDoctorById(doctorId)
    }
  }, [doctorId, hospitalId])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      const result = await doctorService.getDoctors(hospitalId)
      if (result.success) {
        setDoctors(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to load doctors')
      }
    } catch (error: any) {
      console.error('Error loading doctors:', error)
      toast.error("Failed to load doctors", {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDoctorById = async (id: string) => {
    try {
      const result = await doctorService.getDoctorById(id, hospitalId)
      if (result.success) {
        setSelectedDoctor(result.data)
        setIsProfileDialogOpen(true)
      } else {
        throw new Error(result.error || 'Failed to load doctor')
      }
    } catch (error: any) {
      console.error('Error loading doctor:', error)
      toast.error("Failed to load doctor", {
        description: error.message
      })
    }
  }

  const loadDepartments = async () => {
    try {
      const result = await departmentService.getDepartments(hospitalId)
      if (result.success) {
        setDepartments(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to load departments')
      }
    } catch (error: any) {
      console.error('Error loading departments:', error)
      toast.error("Failed to load departments", {
        description: error.message
      })
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDoctors()
    setRefreshing(false)
  }

  // Filter doctors based on search, department, and status
  const getFilteredDoctors = () => {
    return doctors.filter(doctor => {
      const searchMatch = !searchQuery || 
        doctor.users.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.departments?.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const departmentMatch = selectedDepartment === 'all' || doctor.department_id === selectedDepartment
      
      const statusMatch = selectedStatus === 'all' || 
        (selectedStatus === 'active' && doctor.is_active) ||
        (selectedStatus === 'inactive' && !doctor.is_active) ||
        (selectedStatus === 'available' && doctor.is_available)
      
      // Filter by tab
      const tabMatch = 
        activeTab === 'all' || 
        (activeTab === 'available' && doctor.is_available) ||
        (activeTab === 'unavailable' && !doctor.is_available)
      
      return searchMatch && departmentMatch && statusMatch && tabMatch
    })
  }

  // Handle doctor registration
  const handleDoctorRegistration = async (data: any) => {
    try {
      const result = await doctorService.addDoctor(data, hospitalId)
      
      if (result.success) {
        toast.success("Doctor Registered", {
          description: "Doctor has been registered successfully"
        })
        setIsRegisterDialogOpen(false)
        await loadDoctors()
      } else {
        throw new Error(result.error || 'Failed to register doctor')
      }
    } catch (error: any) {
      console.error('Error registering doctor:', error)
      toast.error("Registration Failed", {
        description: error.message || "Failed to register doctor"
      })
    }
  }

  // Handle doctor update
  const handleDoctorUpdate = async (id: string, data: any) => {
    try {
      const result = await doctorService.updateDoctor(id, data, hospitalId)
      
      if (result.success) {
        toast.success("Doctor Updated", {
          description: "Doctor profile has been updated successfully"
        })
        setIsProfileDialogOpen(false)
        await loadDoctors()
      } else {
        throw new Error(result.error || 'Failed to update doctor')
      }
    } catch (error: any) {
      console.error('Error updating doctor:', error)
      toast.error("Update Failed", {
        description: error.message || "Failed to update doctor profile"
      })
    }
  }

  // Handle schedule update
  const handleScheduleUpdate = async (id: string, scheduleData: any) => {
    try {
      const result = await doctorService.updateDoctorSchedule(id, scheduleData, hospitalId)
      
      if (result.success) {
        toast.success("Schedule Updated", {
          description: "Doctor schedule has been updated successfully"
        })
        setIsScheduleDialogOpen(false)
        await loadDoctors()
      } else {
        throw new Error(result.error || 'Failed to update schedule')
      }
    } catch (error: any) {
      console.error('Error updating schedule:', error)
      toast.error("Update Failed", {
        description: error.message || "Failed to update doctor schedule"
      })
    }
  }

  // Handle credentials upload
  const handleCredentialsUpload = async (credentials: any) => {
    try {
      if (!selectedDoctor) return
      
      const result = await doctorService.updateDoctor(
        selectedDoctor.id,
        { 
          professional_info: {
            ...selectedDoctor.professional_info,
            credentials
          }
        },
        hospitalId
      )
      
      if (result.success) {
        toast.success("Credentials Uploaded", {
          description: "Doctor credentials have been uploaded successfully"
        })
        setIsCredentialsDialogOpen(false)
        await loadDoctors()
      } else {
        throw new Error(result.error || 'Failed to upload credentials')
      }
    } catch (error: any) {
      console.error('Error uploading credentials:', error)
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload credentials"
      })
    }
  }

  // Handle MFA setup
  const handleMfaSetup = async () => {
    try {
      toast.success("MFA Setup Complete", {
        description: "Multi-factor authentication has been set up successfully"
      })
      setIsMfaDialogOpen(false)
    } catch (error: any) {
      console.error('Error setting up MFA:', error)
      toast.error("MFA Setup Failed", {
        description: error.message || "Failed to set up multi-factor authentication"
      })
    }
  }

  // Toggle doctor availability
  const toggleAvailability = async (doctor: Doctor) => {
    try {
      const result = await doctorService.updateDoctor(
        doctor.id, 
        { is_available: !doctor.is_available },
        hospitalId
      )
      
      if (result.success) {
        toast.success(doctor.is_available ? "Doctor Marked Unavailable" : "Doctor Marked Available", {
          description: `${doctor.users.full_name} is now ${doctor.is_available ? 'unavailable' : 'available'} for appointments`
        })
        await loadDoctors()
      } else {
        throw new Error(result.error || 'Failed to update availability')
      }
    } catch (error: any) {
      console.error('Error toggling availability:', error)
      toast.error("Update Failed", {
        description: error.message || "Failed to update doctor availability"
      })
    }
  }

  // Deactivate doctor
  const deactivateDoctor = async (doctor: Doctor) => {
    if (!confirm(`Are you sure you want to deactivate ${doctor.users.full_name}?`)) {
      return
    }
    
    try {
      const result = await doctorService.updateDoctor(
        doctor.id, 
        { is_active: false },
        hospitalId
      )
      
      if (result.success) {
        toast.success("Doctor Deactivated", {
          description: `${doctor.users.full_name} has been deactivated`
        })
        await loadDoctors()
      } else {
        throw new Error(result.error || 'Failed to deactivate doctor')
      }
    } catch (error: any) {
      console.error('Error deactivating doctor:', error)
      toast.error("Deactivation Failed", {
        description: error.message || "Failed to deactivate doctor"
      })
    }
  }

  // View doctor profile
  const viewDoctorProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsProfileDialogOpen(true)
  }

  // Edit doctor schedule
  const editDoctorSchedule = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsScheduleDialogOpen(true)
  }

  // Upload doctor credentials
  const uploadDoctorCredentials = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsCredentialsDialogOpen(true)
  }

  // Setup MFA for doctor
  const setupDoctorMfa = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsMfaDialogOpen(true)
  }

  const filteredDoctors = getFilteredDoctors()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Doctors
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage doctor profiles, schedules, and availability
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'calendar' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Grid View
              </>
            )}
          </Button>

          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-medical-600 hover:bg-medical-700">
                <Plus className="w-4 h-4 mr-2" />
                Register Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Doctor</DialogTitle>
                <DialogDescription>
                  Add a new doctor to the hospital management system
                </DialogDescription>
              </DialogHeader>
              <DoctorRegistrationForm 
                departments={departments} 
                onSubmit={handleDoctorRegistration} 
                onCancel={() => setIsRegisterDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setSelectedDepartment('all')
                setSelectedStatus('all')
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Doctors</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-medical-600" />
            </div>
          ) : (
            viewMode === 'grid' ? (
              <DoctorList 
                doctors={filteredDoctors}
                departments={departments}
                onViewProfile={viewDoctorProfile}
                onEditSchedule={editDoctorSchedule}
                onToggleAvailability={toggleAvailability}
                onDeactivate={deactivateDoctor}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Availability Calendar</CardTitle>
                  <CardDescription>
                    View and manage doctor schedules and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Select Doctor</Label>
                      <Select 
                        value={selectedDoctor?.id || ''} 
                        onValueChange={(value) => {
                          const doctor = doctors.find(d => d.id === value)
                          if (doctor) {
                            setSelectedDoctor(doctor)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.users.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {selectedDoctor ? (
                    <div className="mt-6">
                      <DoctorAvailabilityCalendar doctor={selectedDoctor} />
                    </div>
                  ) : (
                    <div className="text-center py-8 mt-6">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Select a doctor to view their availability calendar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>

      {/* Doctor Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Doctor Profile</DialogTitle>
            <DialogDescription>
              View and edit doctor profile information
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <DoctorProfileView 
              doctor={selectedDoctor} 
              departments={departments}
              onUpdate={(data) => handleDoctorUpdate(selectedDoctor.id, data)}
              onClose={() => setIsProfileDialogOpen(false)}
              onUploadCredentials={() => {
                setIsProfileDialogOpen(false)
                setIsCredentialsDialogOpen(true)
              }}
              onSetupMfa={() => {
                setIsProfileDialogOpen(false)
                setIsMfaDialogOpen(true)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Doctor Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Doctor Schedule</DialogTitle>
            <DialogDescription>
              Configure doctor availability and working hours
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <DoctorScheduleForm 
              doctor={selectedDoctor}
              onSubmit={(data) => handleScheduleUpdate(selectedDoctor.id, data)}
              onCancel={() => setIsScheduleDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Doctor Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Doctor Credentials</DialogTitle>
            <DialogDescription>
              Upload and manage doctor credentials and certifications
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <DoctorCredentialsUpload 
              doctorId={selectedDoctor.id}
              onSave={handleCredentialsUpload}
              onCancel={() => setIsCredentialsDialogOpen(false)}
              initialCredentials={selectedDoctor.professional_info?.credentials}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Doctor MFA Setup Dialog */}
      <Dialog open={isMfaDialogOpen} onOpenChange={setIsMfaDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Multi-Factor Authentication Setup</span>
            </DialogTitle>
            <DialogDescription>
              Set up additional security for doctor account
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <DoctorMultiFactorAuth 
              doctorId={selectedDoctor.id}
              email={selectedDoctor.users.email}
              phone={selectedDoctor.personal_info?.mobile || selectedDoctor.users.phone || ''}
              onSetupComplete={handleMfaSetup}
              onCancel={() => setIsMfaDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}