import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  UserCheck, 
  Building2, 
  GraduationCap, 
  Award, 
  Languages, 
  Calendar, 
  DollarSign,
  Upload,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react'

// Types
interface Department {
  id: string
  name: string
  code: string
}

// Validation schema
const doctorRegistrationSchema = z.object({
  // Basic Information
  title: z.enum(['Dr', 'Prof. Dr', 'Assoc. Prof. Dr', 'Asst. Prof. Dr'], {
    required_error: 'Please select a title'
  }),
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'First name can only contain letters, spaces, and dots'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Last name can only contain letters, spaces, and dots'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Please select gender'
  }),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  
  // Professional Information
  employeeId: z.string().min(1, 'Employee ID is required'),
  departmentId: z.string().min(1, 'Department is required'),
  registrationNumber: z.string().min(1, 'Medical registration number is required'),
  registrationCouncil: z.string().min(1, 'Registration council is required'),
  registrationYear: z.string().min(1, 'Registration year is required'),
  qualifications: z.array(z.object({
    degree: z.string().min(1, 'Degree is required'),
    institution: z.string().min(1, 'Institution is required'),
    year: z.string().min(1, 'Year is required')
  })).min(1, 'At least one qualification is required'),
  specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  
  // Consultation Settings
  consultationFee: z.number().min(0, 'Consultation fee must be a positive number'),
  followUpFee: z.number().min(0, 'Follow-up fee must be a positive number'),
  emergencyFee: z.number().min(0, 'Emergency fee must be a positive number'),
  slotDuration: z.number().min(5, 'Slot duration must be at least 5 minutes'),
  maxPatientsPerDay: z.number().min(1, 'Maximum patients per day must be at least 1'),
  
  // Additional Settings
  isAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  bio: z.string().optional(),
  photoFile: z.any().optional()
})

type DoctorRegistrationForm = z.infer<typeof doctorRegistrationSchema>

// Specializations list
const specializations = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Medicine',
  'General Surgery', 'Gynecology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Otolaryngology', 'Pediatrics', 'Psychiatry', 'Pulmonology',
  'Radiology', 'Urology', 'Nephrology', 'Rheumatology', 'Hematology'
]

// Languages list
const languages = [
  'Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu',
  'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 'Sanskrit'
]

// Registration councils
const registrationCouncils = [
  'Medical Council of India (MCI)',
  'National Medical Commission (NMC)',
  'State Medical Council',
  'Dental Council of India',
  'Indian Nursing Council',
  'Pharmacy Council of India',
  'Other'
]

interface DoctorRegistrationFormProps {
  departments: Department[]
  onSubmit: (data: any) => void
  onCancel: () => void
  initialData?: any
  isEditing?: boolean
}

export default function DoctorRegistrationForm({ 
  departments, 
  onSubmit, 
  onCancel,
  initialData,
  isEditing = false
}: DoctorRegistrationFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.personal_info?.photo_url || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DoctorRegistrationForm>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: initialData ? {
      title: initialData.personal_info?.title || 'Dr',
      firstName: initialData.personal_info?.first_name || '',
      lastName: initialData.personal_info?.last_name || '',
      gender: initialData.personal_info?.gender || 'Male',
      dateOfBirth: initialData.personal_info?.date_of_birth || '',
      email: initialData.users?.email || '',
      mobile: initialData.personal_info?.mobile || '',
      employeeId: initialData.employee_id || '',
      departmentId: initialData.department_id || '',
      registrationNumber: initialData.professional_info?.registration_number || '',
      registrationCouncil: initialData.professional_info?.registration_council || '',
      registrationYear: initialData.professional_info?.registration_year || '',
      qualifications: initialData.professional_info?.qualifications || [{ degree: '', institution: '', year: '' }],
      specializations: initialData.professional_info?.specializations || [],
      experience: initialData.professional_info?.experience || 0,
      languages: initialData.professional_info?.languages || [],
      consultationFee: initialData.consultation_fee || 500,
      followUpFee: initialData.professional_info?.follow_up_fee || 300,
      emergencyFee: initialData.professional_info?.emergency_fee || 1000,
      slotDuration: initialData.professional_info?.slot_duration || 15,
      maxPatientsPerDay: initialData.professional_info?.max_patients_per_day || 20,
      isAvailable: initialData.is_available !== undefined ? initialData.is_available : true,
      isActive: initialData.is_active !== undefined ? initialData.is_active : true,
      bio: initialData.professional_info?.bio || ''
    } : {
      title: 'Dr',
      gender: 'Male',
      qualifications: [{ degree: '', institution: '', year: '' }],
      specializations: [],
      languages: [],
      consultationFee: 500,
      followUpFee: 300,
      emergencyFee: 1000,
      slotDuration: 15,
      maxPatientsPerDay: 20,
      isAvailable: true,
      isActive: true
    }
  })

  // Watch form values
  const watchedQualifications = watch('qualifications')

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Photo size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setValue('photoFile', file)
    }
  }

  // Add qualification field
  const addQualification = () => {
    setValue('qualifications', [
      ...watchedQualifications,
      { degree: '', institution: '', year: '' }
    ])
  }

  // Remove qualification field
  const removeQualification = (index: number) => {
    if (watchedQualifications.length > 1) {
      setValue('qualifications', watchedQualifications.filter((_, i) => i !== index))
    }
  }

  // Submit form
  const submitForm = async (data: DoctorRegistrationForm) => {
    setIsSubmitting(true)
    
    try {
      // Prepare data for submission
      const formattedData = {
        employee_id: data.employeeId,
        department_id: data.departmentId,
        personal_info: {
          title: data.title,
          first_name: data.firstName,
          last_name: data.lastName,
          gender: data.gender,
          date_of_birth: data.dateOfBirth,
          mobile: data.mobile,
          photo_url: photoPreview
        },
        professional_info: {
          registration_number: data.registrationNumber,
          registration_council: data.registrationCouncil,
          registration_year: data.registrationYear,
          qualifications: data.qualifications,
          specializations: data.specializations,
          experience: data.experience,
          languages: data.languages,
          follow_up_fee: data.followUpFee,
          emergency_fee: data.emergencyFee,
          slot_duration: data.slotDuration,
          max_patients_per_day: data.maxPatientsPerDay,
          bio: data.bio
        },
        consultation_fee: data.consultationFee,
        is_available: data.isAvailable,
        is_active: data.isActive,
        // If editing, we don't need to include user data
        ...(isEditing ? {} : {
          user: {
            email: data.email,
            full_name: `${data.firstName} ${data.lastName}`,
            phone: data.mobile,
            role: 'doctor'
          }
        })
      }
      
      // Call the onSubmit callback with the formatted data
      await onSubmit(formattedData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="professional">Professional Details</TabsTrigger>
          <TabsTrigger value="settings">Consultation Settings</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6 pt-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Doctor photo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <UserCheck className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="photoFile">Profile Photo</Label>
              <Input
                id="photoFile"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: Square image, max 5MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Prof. Dr">Prof. Dr</SelectItem>
                      <SelectItem value="Assoc. Prof. Dr">Assoc. Prof. Dr</SelectItem>
                      <SelectItem value="Asst. Prof. Dr">Asst. Prof. Dr</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
                disabled={isEditing} // Disable email editing if updating existing doctor
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <Input
                  id="mobile"
                  {...register('mobile')}
                  placeholder="Enter 10-digit mobile"
                  className="rounded-l-none"
                  maxLength={10}
                />
              </div>
              {errors.mobile && (
                <p className="text-sm text-red-600 mt-1">{errors.mobile.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                {...register('employeeId')}
                placeholder="Enter employee ID"
                disabled={isEditing} // Disable employee ID editing if updating existing doctor
              />
              {errors.employeeId && (
                <p className="text-sm text-red-600 mt-1">{errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="departmentId">Department *</Label>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.departmentId && (
                <p className="text-sm text-red-600 mt-1">{errors.departmentId.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Professional Details Tab */}
        <TabsContent value="professional" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="registrationNumber">Medical Registration Number *</Label>
              <Input
                id="registrationNumber"
                {...register('registrationNumber')}
                placeholder="Enter registration number"
              />
              {errors.registrationNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registrationCouncil">Registration Council *</Label>
              <Controller
                name="registrationCouncil"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select council" />
                    </SelectTrigger>
                    <SelectContent>
                      {registrationCouncils.map((council) => (
                        <SelectItem key={council} value={council}>
                          {council}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.registrationCouncil && (
                <p className="text-sm text-red-600 mt-1">{errors.registrationCouncil.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registrationYear">Registration Year *</Label>
              <Input
                id="registrationYear"
                {...register('registrationYear')}
                placeholder="YYYY"
                maxLength={4}
              />
              {errors.registrationYear && (
                <p className="text-sm text-red-600 mt-1">{errors.registrationYear.message}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Qualifications *</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addQualification}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Qualification
              </Button>
            </div>
            
            {watchedQualifications.map((_, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 border rounded-md">
                <div>
                  <Label htmlFor={`qualifications.${index}.degree`}>Degree</Label>
                  <Input
                    id={`qualifications.${index}.degree`}
                    {...register(`qualifications.${index}.degree`)}
                    placeholder="e.g., MBBS, MD, MS"
                  />
                  {errors.qualifications?.[index]?.degree && (
                    <p className="text-sm text-red-600 mt-1">{errors.qualifications[index]?.degree?.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`qualifications.${index}.institution`}>Institution</Label>
                  <Input
                    id={`qualifications.${index}.institution`}
                    {...register(`qualifications.${index}.institution`)}
                    placeholder="Enter institution name"
                  />
                  {errors.qualifications?.[index]?.institution && (
                    <p className="text-sm text-red-600 mt-1">{errors.qualifications[index]?.institution?.message}</p>
                  )}
                </div>
                
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor={`qualifications.${index}.year`}>Year</Label>
                    <Input
                      id={`qualifications.${index}.year`}
                      {...register(`qualifications.${index}.year`)}
                      placeholder="YYYY"
                      maxLength={4}
                    />
                    {errors.qualifications?.[index]?.year && (
                      <p className="text-sm text-red-600 mt-1">{errors.qualifications[index]?.year?.message}</p>
                    )}
                  </div>
                  
                  {watchedQualifications.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeQualification(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specializations">Specializations *</Label>
              <Controller
                name="specializations"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={(value) => {
                      const currentValues = field.value || []
                      if (!currentValues.includes(value)) {
                        field.onChange([...currentValues, value])
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specializations" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((specialization) => (
                        <SelectItem key={specialization} value={specialization}>
                          {specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {watch('specializations')?.map((specialization, index) => (
                  <div 
                    key={index} 
                    className="bg-medical-100 text-medical-800 px-2 py-1 rounded-md text-sm flex items-center"
                  >
                    {specialization}
                    <button
                      type="button"
                      className="ml-2 text-medical-600 hover:text-medical-800"
                      onClick={() => {
                        const currentValues = watch('specializations') || []
                        setValue('specializations', currentValues.filter(s => s !== specialization))
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              {errors.specializations && (
                <p className="text-sm text-red-600 mt-1">{errors.specializations.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="languages">Languages *</Label>
              <Controller
                name="languages"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={(value) => {
                      const currentValues = field.value || []
                      if (!currentValues.includes(value)) {
                        field.onChange([...currentValues, value])
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select languages" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {watch('languages')?.map((language, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center"
                  >
                    {language}
                    <button
                      type="button"
                      className="ml-2 text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        const currentValues = watch('languages') || []
                        setValue('languages', currentValues.filter(l => l !== language))
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              {errors.languages && (
                <p className="text-sm text-red-600 mt-1">{errors.languages.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience">Years of Experience *</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                step="1"
                {...register('experience', { valueAsNumber: true })}
                placeholder="Enter years of experience"
              />
              {errors.experience && (
                <p className="text-sm text-red-600 mt-1">{errors.experience.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Enter professional biography"
              rows={4}
            />
          </div>
        </TabsContent>

        {/* Consultation Settings Tab */}
        <TabsContent value="settings" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="consultationFee">Consultation Fee (₹) *</Label>
              <Input
                id="consultationFee"
                type="number"
                min="0"
                step="1"
                {...register('consultationFee', { valueAsNumber: true })}
                placeholder="Enter consultation fee"
              />
              {errors.consultationFee && (
                <p className="text-sm text-red-600 mt-1">{errors.consultationFee.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="followUpFee">Follow-Up Fee (₹) *</Label>
              <Input
                id="followUpFee"
                type="number"
                min="0"
                step="1"
                {...register('followUpFee', { valueAsNumber: true })}
                placeholder="Enter follow-up fee"
              />
              {errors.followUpFee && (
                <p className="text-sm text-red-600 mt-1">{errors.followUpFee.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyFee">Emergency Fee (₹) *</Label>
              <Input
                id="emergencyFee"
                type="number"
                min="0"
                step="1"
                {...register('emergencyFee', { valueAsNumber: true })}
                placeholder="Enter emergency fee"
              />
              {errors.emergencyFee && (
                <p className="text-sm text-red-600 mt-1">{errors.emergencyFee.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slotDuration">Slot Duration (minutes) *</Label>
              <Controller
                name="slotDuration"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select slot duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.slotDuration && (
                <p className="text-sm text-red-600 mt-1">{errors.slotDuration.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="maxPatientsPerDay">Max Patients Per Day *</Label>
              <Input
                id="maxPatientsPerDay"
                type="number"
                min="1"
                step="1"
                {...register('maxPatientsPerDay', { valueAsNumber: true })}
                placeholder="Enter maximum patients per day"
              />
              {errors.maxPatientsPerDay && (
                <p className="text-sm text-red-600 mt-1">{errors.maxPatientsPerDay.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isAvailable"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isAvailable">Available for Appointments</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800 mb-2">
              <Calendar className="w-5 h-5" />
              <h3 className="font-medium">Schedule Configuration</h3>
            </div>
            <p className="text-sm text-yellow-700">
              After registering the doctor, you'll be able to configure their detailed schedule including working days, hours, and breaks.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-medical-600 hover:bg-medical-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? 'Updating...' : 'Registering...'}
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Doctor' : 'Register Doctor'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}