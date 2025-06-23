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
  User, 
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
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { appointmentService, patientService } from '@/services/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ConsultationPage() {
  const { appointmentId } = useParams()
  const [appointment, setAppointment] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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

  // Load appointment and patient data
  useEffect(() => {
    if (appointmentId && hospitalId) {
      loadAppointmentData()
    }
  }, [appointmentId, hospitalId])

  const loadAppointmentData = async () => {
    setLoading(true)
    try {
      // Load appointment
      const appointmentResult = await appointmentService.getAppointmentById(appointmentId as string, hospitalId)
      
      if (!appointmentResult.success) {
        throw new Error(appointmentResult.error || 'Failed to load appointment')
      }
      
      setAppointment(appointmentResult.data)
      
      // Load patient
      if (appointmentResult.data.patient_id) {
        const patientResult = await patientService.getPatientById(appointmentResult.data.patient_id, hospitalId)
        
        if (!patientResult.success) {
          throw new Error(patientResult.error || 'Failed to load patient data')
        }
        
        setPatient(patientResult.data)
      }
      
      // Set existing data if available
      if (appointmentResult.data.diagnosis) {
        setDiagnosis(appointmentResult.data.diagnosis)
      }
      
      if (appointmentResult.data.notes) {
        setNotes(appointmentResult.data.notes)
      }
      
      if (appointmentResult.data.vital_signs) {
        setVitalSigns(appointmentResult.data.vital_signs)
      }
      
      if (appointmentResult.data.prescription) {
        setMedications(appointmentResult.data.prescription.medications || [])
      }
      
    } catch (error: any) {
      console.error('Error loading appointment data:', error)
      toast.error("Failed to load appointment data", {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
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
    if (!appointment || !hospitalId) {
      toast.error("Missing Data", {
        description: "Appointment data is missing"
      })
      return
    }
    
    setIsSaving(true)
    try {
      // Prepare updated appointment data
      const updatedAppointment = {
        diagnosis,
        notes,
        vital_signs: vitalSigns,
        prescription: {
          medications,
          instructions: notes,
          date: new Date().toISOString()
        },
        status: 'completed'
      }
      
      // Update appointment
      const result = await appointmentService.updateAppointment(
        appointment.id,
        updatedAppointment,
        hospitalId
      )
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save consultation')
      }
      
      toast.success("Consultation Saved", {
        description: "Consultation details have been saved successfully"
      })
      
      // Navigate back to appointments
      navigate('/appointments')
      
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
    if (!appointment || !patient) {
      toast.error("Missing Data", {
        description: "Appointment or patient data is missing"
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
      navigate(`/prescriptions/new?appointmentId=${appointment.id}`)
      
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

  if (!appointment || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold">Appointment Not Found</p>
          <p className="text-gray-600 mt-2">The requested appointment could not be found</p>
          <Button 
            onClick={() => navigate('/appointments')}
            className="mt-4"
          >
            Back to Appointments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/appointments')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Consultation
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage patient consultation and prescription
        </p>
      </div>

      {/* Patient Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-2 border-medical-100">
              <AvatarImage src={patient.personal_info?.photo_url || ''} alt={`${patient.personal_info?.first_name} ${patient.personal_info?.last_name}`} />
              <AvatarFallback className="bg-medical-600 text-white text-lg">
                {`${patient.personal_info?.first_name?.[0] || ''}${patient.personal_info?.last_name?.[0] || ''}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{patient.personal_info?.first_name} {patient.personal_info?.last_name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{patient.uhid}</Badge>
                <Badge className={patient.personal_info?.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}>
                  {patient.personal_info?.gender}
                </Badge>
                <Badge className="bg-gray-100 text-gray-800">
                  {patient.personal_info?.age} years
                </Badge>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Appointment: {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time.substring(0, 5)}
              </div>
            </div>
            <div className="ml-auto">
              <Badge className={
                appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }>
                {appointment.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
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
                    {patient.medical_info?.chronic_conditions?.length > 0 ? (
                      patient.medical_info.chronic_conditions.map((condition: string, index: number) => (
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
                    {patient.medical_info?.allergies?.length > 0 ? (
                      patient.medical_info.allergies.map((allergy: string, index: number) => (
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
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="outline" onClick={() => navigate('/appointments')}>
          Cancel
        </Button>
        <Button 
          variant="outline"
          onClick={generatePrescription}
          disabled={medications.length === 0 || isSaving}
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Prescription
        </Button>
        <Button
          onClick={saveConsultation}
          disabled={isSaving}
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