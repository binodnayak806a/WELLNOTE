import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  UserCheck, 
  Stethoscope, 
  Pill, 
  FileText, 
  Calendar, 
  Clock,
  Save,
  Printer,
  Download,
  Send,
  Plus,
  Trash2,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { doctorService } from '@/services/doctorService'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function DoctorConsultationPage() {
  const { doctorId } = useParams()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [vitalSigns, setVitalSigns] = useState({
    temperature: '',
    pulse: '',
    respiration: '',
    bloodPressure: '',
    oxygenSaturation: '',
    weight: '',
    height: ''
  })
  const [medications, setMedications] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  const { hospitalId } = useAuth()
  const navigate = useNavigate()

  // Load doctor data
  useEffect(() => {
    if (doctorId && hospitalId) {
      loadDoctorData()
      loadPatients()
    }
  }, [doctorId, hospitalId])

  const loadDoctorData = async () => {
    setLoading(true)
    try {
      const result = await doctorService.getDoctorById(doctorId as string, hospitalId)
      if (result.success) {
        setDoctor(result.data)
      } else {
        throw new Error(result.error || 'Failed to load doctor data')
      }
    } catch (error: any) {
      console.error('Error loading doctor data:', error)
      toast.error("Failed to load doctor data", {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      // Mock data for patients
      setPatients([
        {
          id: '1',
          uhid: 'UH123456',
          personal_info: {
            first_name: 'Rajesh',
            last_name: 'Kumar',
            gender: 'Male',
            age: 45,
            blood_group: 'B+'
          },
          medical_info: {
            allergies: ['Penicillin'],
            chronic_conditions: ['Hypertension', 'Diabetes']
          }
        },
        {
          id: '2',
          uhid: 'UH123457',
          personal_info: {
            first_name: 'Priya',
            last_name: 'Singh',
            gender: 'Female',
            age: 32,
            blood_group: 'O+'
          },
          medical_info: {
            allergies: [],
            chronic_conditions: ['Asthma']
          }
        },
        {
          id: '3',
          uhid: 'UH123458',
          personal_info: {
            first_name: 'Amit',
            last_name: 'Verma',
            gender: 'Male',
            age: 28,
            blood_group: 'A+'
          },
          medical_info: {
            allergies: ['Sulfa drugs'],
            chronic_conditions: []
          }
        }
      ])
    } catch (error: any) {
      console.error('Error loading patients:', error)
      toast.error("Failed to load patients", {
        description: error.message
      })
    }
  }

  // Search patients
  const searchPatients = (query: string) => {
    if (!query.trim()) return []
    
    return patients.filter(patient => {
      const fullName = `${patient.personal_info.first_name} ${patient.personal_info.last_name}`.toLowerCase()
      const searchTerm = query.toLowerCase()
      
      return (
        patient.uhid.toLowerCase().includes(searchTerm) ||
        fullName.includes(searchTerm)
      )
    })
  }

  // Add medication
  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: Date.now().toString(),
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ])
  }

  // Update medication
  const updateMedication = (id: string, field: string, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ))
  }

  // Remove medication
  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id))
  }

  // Save consultation
  const saveConsultation = async () => {
    if (!selectedPatient) {
      toast.error("Patient Required", {
        description: "Please select a patient to save the consultation"
      })
      return
    }
    
    setIsSaving(true)
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success("Consultation Saved", {
        description: "Consultation details have been saved successfully"
      })
      
      // Clear form
      setDiagnosis('')
      setNotes('')
      setVitalSigns({
        temperature: '',
        pulse: '',
        respiration: '',
        bloodPressure: '',
        oxygenSaturation: '',
        weight: '',
        height: ''
      })
      setMedications([])
      setSelectedPatient(null)
      setSearchQuery('')
      
    } catch (error: any) {
      console.error('Error saving consultation:', error)
      toast.error("Save Failed", {
        description: error.message || "Failed to save consultation"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Generate prescription
  const generatePrescription = async () => {
    if (!selectedPatient) {
      toast.error("Patient Required", {
        description: "Please select a patient to generate prescription"
      })
      return
    }
    
    if (medications.length === 0) {
      toast.error("Medications Required", {
        description: "Please add at least one medication to generate prescription"
      })
      return
    }
    
    try {
      // In a real implementation, this would generate a prescription
      toast.success("Prescription Generated", {
        description: "Prescription has been generated successfully"
      })
      
      // Navigate to prescription view
      navigate(`/prescriptions/new?patientId=${selectedPatient.id}&doctorId=${doctorId}`)
      
    } catch (error: any) {
      console.error('Error generating prescription:', error)
      toast.error("Generation Failed", {
        description: error.message || "Failed to generate prescription"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading consultation data...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold">Doctor Not Found</p>
          <p className="text-gray-600 mt-2">The requested doctor could not be found</p>
          <Button 
            onClick={() => navigate('/doctors')}
            className="mt-4"
          >
            Back to Doctors
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Doctor Consultation
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage patient consultations and prescriptions
        </p>
      </div>

      {/* Doctor Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-2 border-medical-100">
              <AvatarImage src={doctor.personal_info?.photo_url || ''} alt={doctor.users.full_name} />
              <AvatarFallback className="bg-medical-600 text-white text-lg">
                {doctor.users.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">Dr. {doctor.users.full_name}</h2>
              <p className="text-gray-600">{doctor.departments?.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-medical-100 text-medical-800">
                  {doctor.professional_info?.specializations?.[0] || 'General Practitioner'}
                </Badge>
                {doctor.is_available ? (
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">Unavailable</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>Patient Selection</span>
          </CardTitle>
          <CardDescription>
            Search and select a patient for consultation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search patients by name or UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchQuery && (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {searchPatients(searchQuery).length > 0 ? (
                  searchPatients(searchQuery).map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedPatient(patient)
                        setSearchQuery(`${patient.personal_info.first_name} ${patient.personal_info.last_name} (${patient.uhid})`)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {patient.personal_info.first_name} {patient.personal_info.last_name}
                          </p>
                          <p className="text-sm text-gray-600">UHID: {patient.uhid}</p>
                          <p className="text-sm text-gray-500">
                            {patient.personal_info.age} years, {patient.personal_info.gender}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {patient.personal_info.blood_group}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No patients found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
            
            {selectedPatient && (
              <div className="p-4 bg-medical-50 border border-medical-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-medical-800">
                      Selected Patient: {selectedPatient.personal_info.first_name} {selectedPatient.personal_info.last_name}
                    </h3>
                    <p className="text-sm text-medical-600">
                      UHID: {selectedPatient.uhid} | {selectedPatient.personal_info.age} years, {selectedPatient.personal_info.gender}
                    </p>
                    
                    {selectedPatient.medical_info.allergies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-600">Allergies:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.medical_info.allergies.map((allergy: string, index: number) => (
                            <Badge key={index} className="bg-red-100 text-red-800">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedPatient.medical_info.chronic_conditions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-orange-600">Chronic Conditions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.medical_info.chronic_conditions.map((condition: string, index: number) => (
                            <Badge key={index} className="bg-orange-100 text-orange-800">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(null)
                      setSearchQuery('')
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consultation Form */}
      <Tabs defaultValue="consultation">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consultation">
            <Stethoscope className="w-4 h-4 mr-2" />
            Consultation
          </TabsTrigger>
          <TabsTrigger value="prescription">
            <Pill className="w-4 h-4 mr-2" />
            Prescription
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="w-4 h-4 mr-2" />
            Patient History
          </TabsTrigger>
        </TabsList>

        {/* Consultation Tab */}
        <TabsContent value="consultation" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>
                Record patient's vital signs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    placeholder="e.g., 37.0"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pulse">Pulse (bpm)</Label>
                  <Input
                    id="pulse"
                    placeholder="e.g., 72"
                    value={vitalSigns.pulse}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, pulse: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="respiration">Respiration (bpm)</Label>
                  <Input
                    id="respiration"
                    placeholder="e.g., 16"
                    value={vitalSigns.respiration}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, respiration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                  <Input
                    id="bloodPressure"
                    placeholder="e.g., 120/80"
                    value={vitalSigns.bloodPressure}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                  <Input
                    id="oxygenSaturation"
                    placeholder="e.g., 98"
                    value={vitalSigns.oxygenSaturation}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    placeholder="e.g., 70"
                    value={vitalSigns.weight}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    placeholder="e.g., 170"
                    value={vitalSigns.height}
                    onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diagnosis & Notes</CardTitle>
              <CardDescription>
                Enter diagnosis and clinical notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter clinical notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescription Tab */}
        <TabsContent value="prescription" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Medications</span>
                <Button onClick={addMedication} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </CardTitle>
              <CardDescription>
                Prescribe medications for the patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No medications added yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={addMedication}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Medication #{medications.indexOf(medication) + 1}</h3>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeMedication(medication.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Medication Name</Label>
                          <Input
                            value={medication.name}
                            onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                            placeholder="Enter medication name"
                          />
                        </div>
                        <div>
                          <Label>Dosage</Label>
                          <Input
                            value={medication.dosage}
                            onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label>Frequency</Label>
                          <Select 
                            value={medication.frequency} 
                            onValueChange={(value) => updateMedication(medication.id, 'frequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Once daily">Once daily</SelectItem>
                              <SelectItem value="Twice daily">Twice daily</SelectItem>
                              <SelectItem value="Three times daily">Three times daily</SelectItem>
                              <SelectItem value="Four times daily">Four times daily</SelectItem>
                              <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                              <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                              <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                              <SelectItem value="As needed">As needed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <Input
                            value={medication.duration}
                            onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div>
                          <Label>Route</Label>
                          <Select 
                            value={medication.route} 
                            onValueChange={(value) => updateMedication(medication.id, 'route', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select route" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Oral">Oral</SelectItem>
                              <SelectItem value="Intravenous">Intravenous</SelectItem>
                              <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                              <SelectItem value="Subcutaneous">Subcutaneous</SelectItem>
                              <SelectItem value="Topical">Topical</SelectItem>
                              <SelectItem value="Inhalation">Inhalation</SelectItem>
                              <SelectItem value="Rectal">Rectal</SelectItem>
                              <SelectItem value="Nasal">Nasal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label>Special Instructions</Label>
                        <Textarea
                          value={medication.instructions}
                          onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                          placeholder="Enter any special instructions"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-Up</CardTitle>
              <CardDescription>
                Schedule follow-up appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="followUpDate">Follow-Up Date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="followUpNotes">Follow-Up Notes</Label>
                  <Input
                    id="followUpNotes"
                    placeholder="Enter follow-up notes"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient History Tab */}
        <TabsContent value="history" className="space-y-6 pt-4">
          {selectedPatient ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                  <CardDescription>
                    Patient's medical history and previous consultations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Chronic Conditions</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.medical_info.chronic_conditions.length > 0 ? (
                          selectedPatient.medical_info.chronic_conditions.map((condition: string, index: number) => (
                            <Badge key={index} className="bg-orange-100 text-orange-800">
                              {condition}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">No chronic conditions recorded</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Allergies</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.medical_info.allergies.length > 0 ? (
                          selectedPatient.medical_info.allergies.map((allergy: string, index: number) => (
                            <Badge key={index} className="bg-red-100 text-red-800">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">No allergies recorded</p>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Previous Consultations</h3>
                      <div className="text-center py-4">
                        <p className="text-gray-500">No previous consultations found</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Prescription History</CardTitle>
                  <CardDescription>
                    Previous prescriptions for this patient
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-gray-500">No prescription history found</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Please select a patient to view history</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="outline" onClick={() => navigate('/doctors')}>
          Back to Doctors
        </Button>
        <Button 
          variant="outline"
          onClick={generatePrescription}
          disabled={!selectedPatient || medications.length === 0 || isSaving}
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Prescription
        </Button>
        <Button
          onClick={saveConsultation}
          disabled={!selectedPatient || isSaving}
          className="bg-medical-600 hover:bg-medical-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Consultation
            </>
          )}
        </Button>
      </div>
    </div>
  )
}