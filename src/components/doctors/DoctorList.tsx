import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  UserCheck, 
  Eye, 
  Calendar,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Stethoscope,
  Clock
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'

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

interface DoctorListProps {
  doctors?: Doctor[]
  departments: Department[]
  onViewProfile: (doctor: Doctor) => void
  onEditSchedule: (doctor: Doctor) => void
  onToggleAvailability: (doctor: Doctor) => void
  onDeactivate: (doctor: Doctor) => void
}

export default function DoctorList({
  doctors = [],
  departments,
  onViewProfile,
  onEditSchedule,
  onToggleAvailability,
  onDeactivate
}: DoctorListProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Get status badge
  const getStatusBadge = (doctor: Doctor) => {
    if (!doctor.is_active) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactive</Badge>
    }
    
    if (doctor.is_available) {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800">Unavailable</Badge>
  }

  // Navigate to doctor's consultation page
  const navigateToConsultation = (doctorId: string) => {
    navigate(`/consultation/doctor/${doctorId}`)
  }

  if (doctors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <UserCheck className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No doctors found</p>
          <Button 
            className="mt-4 bg-medical-600 hover:bg-medical-700"
            onClick={() => navigate('/doctors/register')}
          >
            Register New Doctor
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <Card key={doctor.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-medical-100">
                  <AvatarImage src={doctor.personal_info?.photo_url || ''} alt={doctor.users.full_name} />
                  <AvatarFallback className="bg-medical-600 text-white text-lg">
                    {doctor.users.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">Dr. {doctor.users.full_name}</h3>
                  <p className="text-sm text-gray-600">{doctor.departments?.name}</p>
                  <div className="mt-1">{getStatusBadge(doctor)}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewProfile(doctor)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditSchedule(doctor)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Edit Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateToConsultation(doctor.id)}>
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Start Consultation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleAvailability(doctor)}>
                    {doctor.is_available ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Mark Unavailable
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Available
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDeactivate(doctor)}
                    className="text-red-600 hover:text-red-700 focus:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Stethoscope className="w-4 h-4 mr-2" />
                {doctor.professional_info?.specializations?.join(', ') || 'General Practitioner'}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Experience: {doctor.professional_info?.experience || 0} years
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewProfile(doctor)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigateToConsultation(doctor.id)}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Consult
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}