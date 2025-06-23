import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  FileText,
  Calendar,
  Clipboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { patientService } from '@/services/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Types
interface Patient {
  id: string
  patient_id: string
  uhid: string
  personal_info: {
    first_name: string
    last_name: string
    gender: string
    age: number
    mobile?: string
    email?: string
    blood_group?: string
    photo_url?: string
  }
  contact_info: {
    address_line?: string
    city?: string
    state?: string
    pincode?: string
  }
  medical_info: {
    allergies: string[]
    chronic_conditions: string[]
  }
  registration_date: string
  last_visit?: string
  is_active: boolean
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const { hospitalId } = useAuth()
  const navigate = useNavigate()

  // Load patients
  useEffect(() => {
    if (hospitalId) {
      loadPatients()
    }
  }, [hospitalId])

  const loadPatients = async () => {
    setLoading(true)
    try {
      const result = await patientService.getPatients(hospitalId)
      if (result.success) {
        setPatients(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to load patients')
      }
    } catch (error: any) {
      console.error('Error loading patients:', error)
      toast.error("Failed to load patients", {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadPatients()
    setRefreshing(false)
  }

  // Filter patients
  const getFilteredPatients = () => {
    return patients.filter(patient => {
      const fullName = `${patient.personal_info.first_name} ${patient.personal_info.last_name}`.toLowerCase()
      const searchMatch = !searchQuery || 
        fullName.includes(searchQuery.toLowerCase()) ||
        patient.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.personal_info.mobile && patient.personal_info.mobile.includes(searchQuery))
      
      const genderMatch = selectedGender === 'all' || patient.personal_info.gender === selectedGender
      const statusMatch = selectedStatus === 'all' || 
        (selectedStatus === 'active' && patient.is_active) ||
        (selectedStatus === 'inactive' && !patient.is_active)
      
      return searchMatch && genderMatch && statusMatch
    })
  }

  // Pagination
  const getPaginatedPatients = () => {
    const filtered = getFilteredPatients()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return {
      data: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    }
  }

  // View patient details
  const viewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewModalOpen(true)
  }

  // Edit patient
  const editPatient = (patient: Patient) => {
    navigate(`/patients/edit/${patient.id}`)
  }

  // Delete patient
  const deletePatient = async () => {
    if (!selectedPatient || !hospitalId) return
    
    try {
      const result = await patientService.deletePatient(selectedPatient.id, hospitalId)
      
      if (result.success) {
        toast.success("Patient Deleted", {
          description: "Patient has been deleted successfully"
        })
        setIsDeleteModalOpen(false)
        await loadPatients()
      } else {
        throw new Error(result.error || 'Failed to delete patient')
      }
    } catch (error: any) {
      console.error('Error deleting patient:', error)
      toast.error("Delete Failed", {
        description: error.message || "Failed to delete patient"
      })
    }
  }

  // Create appointment for patient
  const createAppointment = (patient: Patient) => {
    navigate(`/appointments/new?patientId=${patient.id}`)
  }

  // Get patient initials for avatar
  const getPatientInitials = (patient: Patient) => {
    return `${patient.personal_info.first_name.charAt(0)}${patient.personal_info.last_name.charAt(0)}`.toUpperCase()
  }

  // Get gender badge color
  const getGenderBadgeColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male': return 'bg-blue-100 text-blue-800'
      case 'female': return 'bg-pink-100 text-pink-800'
      default: return 'bg-purple-100 text-purple-800'
    }
  }

  const { data: paginatedData, total, totalPages } = getPaginatedPatients()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Patients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage patient records and information
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
          <Button onClick={() => navigate('/opd/register')} className="bg-medical-600 hover:bg-medical-700">
            <Plus className="w-4 h-4 mr-2" />
            Register Patient
          </Button>
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
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Gender</Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setSelectedGender('all')
                setSelectedStatus('all')
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Patients</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-medical-600" />
            </div>
          ) : paginatedData.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No patients found</p>
                <Button 
                  className="mt-4 bg-medical-600 hover:bg-medical-700"
                  onClick={() => navigate('/opd/register')}
                >
                  Register New Patient
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Patient</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">UHID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Gender</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Age</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Contact</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Registered</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={patient.personal_info.photo_url} alt={`${patient.personal_info.first_name} ${patient.personal_info.last_name}`} />
                              <AvatarFallback className="bg-medical-100 text-medical-800">
                                {getPatientInitials(patient)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.personal_info.first_name} {patient.personal_info.last_name}</p>
                              <p className="text-sm text-gray-500">{patient.patient_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{patient.uhid}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getGenderBadgeColor(patient.personal_info.gender)}>
                            {patient.personal_info.gender}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{patient.personal_info.age}</td>
                        <td className="px-4 py-3">
                          <p>{patient.personal_info.mobile || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{patient.personal_info.email || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p>{new Date(patient.registration_date).toLocaleDateString()}</p>
                          {patient.last_visit && (
                            <p className="text-xs text-gray-500">
                              Last visit: {new Date(patient.last_visit).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {patient.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => viewPatientDetails(patient)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => editPatient(patient)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => createAppointment(patient)}>
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setSelectedPatient(patient)
                                setIsDeleteModalOpen(true)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} patients
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Patient Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Comprehensive patient information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Header */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20 border-2 border-medical-100">
                  <AvatarImage src={selectedPatient.personal_info.photo_url} alt={`${selectedPatient.personal_info.first_name} ${selectedPatient.personal_info.last_name}`} />
                  <AvatarFallback className="bg-medical-600 text-white text-xl">
                    {getPatientInitials(selectedPatient)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{selectedPatient.personal_info.first_name} {selectedPatient.personal_info.last_name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{selectedPatient.uhid}</Badge>
                    <Badge className={getGenderBadgeColor(selectedPatient.personal_info.gender)}>
                      {selectedPatient.personal_info.gender}
                    </Badge>
                    {selectedPatient.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="medical">Medical Info</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Users className="w-5 h-5" />
                          <span>Personal Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{selectedPatient.personal_info.first_name} {selectedPatient.personal_info.last_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">{selectedPatient.personal_info.gender}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="font-medium">{selectedPatient.personal_info.age} years</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Blood Group</p>
                            <p className="font-medium">{selectedPatient.personal_info.blood_group || 'Not specified'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Contact Information</p>
                          <div className="space-y-1">
                            <p className="text-sm">Mobile: {selectedPatient.personal_info.mobile || 'N/A'}</p>
                            <p className="text-sm">Email: {selectedPatient.personal_info.email || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Address</p>
                          <div className="space-y-1">
                            <p className="text-sm">{selectedPatient.contact_info.address_line || 'N/A'}</p>
                            <p className="text-sm">
                              {[
                                selectedPatient.contact_info.city,
                                selectedPatient.contact_info.state,
                                selectedPatient.contact_info.pincode
                              ].filter(Boolean).join(', ') || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Registration Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Clipboard className="w-5 h-5" />
                          <span>Registration Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Patient ID</p>
                            <p className="font-medium">{selectedPatient.patient_id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">UHID</p>
                            <p className="font-medium">{selectedPatient.uhid}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Registration Date</p>
                            <p className="font-medium">{new Date(selectedPatient.registration_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Last Visit</p>
                            <p className="font-medium">
                              {selectedPatient.last_visit ? new Date(selectedPatient.last_visit).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => createAppointment(selectedPatient)} className="bg-medical-600 hover:bg-medical-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                    <Button variant="outline" onClick={() => editPatient(selectedPatient)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Patient
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/patients/${selectedPatient.id}/history`)}>
                      <FileText className="w-4 h-4 mr-2" />
                      View Medical History
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Medical Information</CardTitle>
                      <CardDescription>
                        Patient's medical history and conditions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Allergies</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.medical_info.allergies.length > 0 ? (
                            selectedPatient.medical_info.allergies.map((allergy, index) => (
                              <Badge key={index} className="bg-red-100 text-red-800">
                                {allergy}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No known allergies</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Chronic Conditions</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.medical_info.chronic_conditions.length > 0 ? (
                            selectedPatient.medical_info.chronic_conditions.map((condition, index) => (
                              <Badge key={index} className="bg-orange-100 text-orange-800">
                                {condition}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No chronic conditions</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appointments" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appointment History</CardTitle>
                      <CardDescription>
                        Patient's past and upcoming appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No appointment history available</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => createAppointment(selectedPatient)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Appointment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing History</CardTitle>
                      <CardDescription>
                        Patient's billing and payment history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No billing history available</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this patient? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-red-50">
                <p className="font-medium text-red-800">
                  {selectedPatient.personal_info.first_name} {selectedPatient.personal_info.last_name}
                </p>
                <p className="text-sm text-red-600">
                  UHID: {selectedPatient.uhid}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deletePatient}
                >
                  Delete Patient
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}