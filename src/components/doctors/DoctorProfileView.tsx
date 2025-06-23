import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  UserCheck, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Award, 
  Languages, 
  Building2, 
  DollarSign,
  Edit,
  Clock,
  Users,
  FileText,
  Shield,
  Upload,
  Stethoscope
} from 'lucide-react'
import DoctorRegistrationForm from './DoctorRegistrationForm'
import DoctorQualificationsForm from './DoctorQualificationsForm'
import { useNavigate } from 'react-router-dom'

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

interface DoctorProfileViewProps {
  doctor: Doctor
  departments: Department[]
  onUpdate: (data: any) => void
  onClose: () => void
  onUploadCredentials?: () => void
  onSetupMfa?: () => void
}

export default function DoctorProfileView({ 
  doctor, 
  departments,
  onUpdate,
  onClose,
  onUploadCredentials,
  onSetupMfa
}: DoctorProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingQualifications, setIsEditingQualifications] = useState(false)
  const navigate = useNavigate()

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get doctor's full name
  const getFullName = () => {
    const title = doctor.personal_info?.title || 'Dr'
    const firstName = doctor.personal_info?.first_name || ''
    const lastName = doctor.personal_info?.last_name || ''
    return `${title} ${firstName} ${lastName}`
  }

  // Get doctor's initials for avatar fallback
  const getInitials = () => {
    const firstName = doctor.personal_info?.first_name || ''
    const lastName = doctor.personal_info?.last_name || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Handle update
  const handleUpdate = async (data: any) => {
    await onUpdate(data)
    setIsEditing(false)
  }

  // Handle qualifications update
  const handleQualificationsUpdate = async (data: any) => {
    const professionalInfo = {
      ...doctor.professional_info,
      ...data
    }
    
    await onUpdate({ professional_info: professionalInfo })
    setIsEditingQualifications(false)
  }

  // Navigate to consultation page
  const navigateToConsultation = () => {
    navigate(`/consultation/doctor/${doctor.id}`)
  }

  if (isEditing) {
    return (
      <DoctorRegistrationForm
        departments={departments}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
        initialData={doctor}
        isEditing={true}
      />
    )
  }

  if (isEditingQualifications) {
    return (
      <DoctorQualificationsForm
        initialData={doctor.professional_info}
        onSubmit={handleQualificationsUpdate}
        onCancel={() => setIsEditingQualifications(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20 border-2 border-medical-100">
            <AvatarImage src={doctor.personal_info?.photo_url || ''} alt={getFullName()} />
            <AvatarFallback className="bg-medical-600 text-white text-xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{getFullName()}</h2>
            <p className="text-gray-600">{doctor.departments?.name}</p>
            <div className="flex items-center space-x-2 mt-1">
              {doctor.is_active ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactive</Badge>
              )}
              
              {doctor.is_available ? (
                <Badge className="bg-blue-100 text-blue-800">Available</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">Unavailable</Badge>
              )}
              
              {doctor.personal_info?.mfa?.enabled && (
                <Badge className="bg-purple-100 text-purple-800">MFA Enabled</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {onSetupMfa && !doctor.personal_info?.mfa?.enabled && (
            <Button variant="outline" onClick={onSetupMfa}>
              <Shield className="w-4 h-4 mr-2" />
              Setup MFA
            </Button>
          )}
          
          {onUploadCredentials && (
            <Button variant="outline" onClick={onUploadCredentials}>
              <Upload className="w-4 h-4 mr-2" />
              Credentials
            </Button>
          )}
          
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{getFullName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{doctor.personal_info?.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{formatDate(doctor.personal_info?.date_of_birth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="font-medium">{doctor.employee_id}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <span>{doctor.users?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{doctor.personal_info?.mobile || doctor.users?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Building2 className="w-4 h-4" />
                    <span>{doctor.departments?.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Professional Information</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingQualifications(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="font-medium">{doctor.professional_info?.registration_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Year</p>
                    <p className="font-medium">{doctor.professional_info?.registration_year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{doctor.professional_info?.experience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Council</p>
                    <p className="font-medium">{doctor.professional_info?.registration_council || 'N/A'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.professional_info?.specializations?.map((specialization: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-medical-50 text-medical-800 border-medical-200">
                        {specialization}
                      </Badge>
                    )) || <span className="text-gray-500">No specializations listed</span>}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.professional_info?.languages?.map((language: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
                        {language}
                      </Badge>
                    )) || <span className="text-gray-500">No languages listed</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consultation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Consultation Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="text-xl font-bold text-medical-600">₹{doctor.consultation_fee}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Follow-Up Fee</p>
                  <p className="text-xl font-bold text-medical-600">₹{doctor.professional_info?.follow_up_fee || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Emergency Fee</p>
                  <p className="text-xl font-bold text-medical-600">₹{doctor.professional_info?.emergency_fee || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Slot Duration</p>
                  <p className="text-xl font-bold text-medical-600">{doctor.professional_info?.slot_duration || 15} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {doctor.professional_info?.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Professional Bio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{doctor.professional_info.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={navigateToConsultation} className="bg-medical-600 hover:bg-medical-700">
              <Stethoscope className="w-4 h-4 mr-2" />
              Start Consultation
            </Button>
            <Button variant="outline" onClick={() => navigate(`/appointments/new?doctorId=${doctor.id}`)}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </TabsContent>

        {/* Qualifications Tab */}
        <TabsContent value="qualifications" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Educational & Professional Qualifications</h3>
            <Button variant="outline" size="sm" onClick={() => setIsEditingQualifications(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Qualifications
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>Educational Qualifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doctor.professional_info?.qualifications?.length > 0 ? (
                <div className="space-y-4">
                  {doctor.professional_info.qualifications.map((qualification: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-medical-600" />
                        <h3 className="font-medium">{qualification.degree}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Institution</p>
                          <p className="font-medium">{qualification.institution}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Year</p>
                          <p className="font-medium">{qualification.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No qualifications listed</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Specializations & Expertise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.professional_info?.specializations?.map((specialization: string, index: number) => (
                      <Badge key={index} className="bg-medical-100 text-medical-800 border-medical-200">
                        {specialization}
                      </Badge>
                    )) || <span className="text-gray-500">No specializations listed</span>}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.professional_info?.languages?.map((language: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    )) || <span className="text-gray-500">No languages listed</span>}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Experience</h3>
                    <p className="font-medium">{doctor.professional_info?.experience || 0} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Registration</h3>
                    <p className="font-medium">{doctor.professional_info?.registration_number || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      {doctor.professional_info?.registration_council || 'N/A'}, {doctor.professional_info?.registration_year || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Credentials & Documents</span>
                </div>
                {onUploadCredentials && (
                  <Button size="sm" variant="outline" onClick={onUploadCredentials}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Credentials
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doctor.professional_info?.credentials?.length > 0 ? (
                <div className="space-y-3">
                  {doctor.professional_info.credentials.map((credential: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{credential.type}</p>
                          <p className="text-sm text-gray-500">{credential.name}</p>
                        </div>
                      </div>
                      <Badge className={
                        credential.status === 'verified' ? 'bg-green-100 text-green-800' :
                        credential.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        credential.status === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {credential.status.charAt(0).toUpperCase() + credential.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No credentials uploaded yet</p>
                  {onUploadCredentials && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={onUploadCredentials}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Credentials
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Working Schedule</span>
                </div>
              </CardTitle>
              <CardDescription>
                Doctor's working days and hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {doctor.schedule?.workingDays ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const isWorkingDay = doctor.schedule.workingDays.includes(day)
                      return (
                        <div 
                          key={day} 
                          className={`p-3 rounded-lg text-center ${
                            isWorkingDay 
                              ? 'bg-medical-100 text-medical-800 border border-medical-200' 
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm font-medium">{day.substring(0, 3)}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Working Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctor.schedule.workingDays?.map((day: string) => (
                        <div key={day} className="p-3 border rounded-lg">
                          <p className="font-medium">{day}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-gray-500">Morning</p>
                              <p className="text-sm">
                                {doctor.schedule.shifts?.[day]?.morning?.start || 'N/A'} - {doctor.schedule.shifts?.[day]?.morning?.end || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Evening</p>
                              <p className="text-sm">
                                {doctor.schedule.shifts?.[day]?.evening?.start || 'N/A'} - {doctor.schedule.shifts?.[day]?.evening?.end || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {doctor.schedule.breaks && doctor.schedule.breaks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Breaks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {doctor.schedule.breaks.map((breakItem: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg bg-gray-50">
                            <p className="font-medium">{breakItem.name}</p>
                            <div className="flex justify-between mt-1 text-sm">
                              <span>{breakItem.start} - {breakItem.end}</span>
                              <span className="text-gray-500">{breakItem.days.join(', ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {doctor.schedule.leaves && doctor.schedule.leaves.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Upcoming Leaves</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {doctor.schedule.leaves.map((leave: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg bg-orange-50">
                            <p className="font-medium">{leave.reason}</p>
                            <div className="flex justify-between mt-1 text-sm">
                              <span>{formatDate(leave.from)} - {formatDate(leave.to)}</span>
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                                {leave.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No schedule configured yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Consultation Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Slot Duration</p>
                  <p className="text-xl font-bold text-medical-600">{doctor.professional_info?.slot_duration || 15} min</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Max Patients/Day</p>
                  <p className="text-xl font-bold text-medical-600">{doctor.professional_info?.max_patients_per_day || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="text-xl font-bold text-medical-600">₹{doctor.consultation_fee}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Follow-Up Fee</p>
                  <p className="text-xl font-bold text-medical-600">₹{doctor.professional_info?.follow_up_fee || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Patient Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-xl font-bold text-medical-600">0</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-xl font-bold text-medical-600">0</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">This Week</p>
                  <p className="text-xl font-bold text-medical-600">0</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-xl font-bold text-medical-600">0</p>
                </div>
              </div>
              
              <div className="mt-6 text-center py-8">
                <p className="text-gray-500">Detailed statistics will be available once the doctor starts seeing patients</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}