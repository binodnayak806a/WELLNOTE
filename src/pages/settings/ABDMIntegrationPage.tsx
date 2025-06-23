import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Key, 
  QrCode, 
  Lock, 
  UserCheck, 
  FileText, 
  Settings,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Search,
  Download,
  Upload,
  Link,
  Unlink
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// Types
interface ABDMSettings {
  enabled: boolean
  clientId: string
  clientSecret: string
  apiEndpoint: string
  callbackUrl: string
  environment: 'sandbox' | 'production'
  consentEnabled: boolean
  consentDuration: number
  consentTemplate: string
}

interface ABDMConsent {
  id: string
  patient_id: string
  consent_id: string
  consent_status: string
  data_access_level: string
  valid_from: string
  valid_until: string
  created_at: string
  patients: {
    personal_info: {
      first_name: string
      last_name: string
    }
    uhid: string
  }
}

interface ABDMLinkedPatient {
  id: string
  patient_id: string
  uhid: string
  abha_id: string
  abha_number: string
  linked_at: string
  personal_info: {
    first_name: string
    last_name: string
    gender: string
    age: number
  }
}

// Validation schema
const abdmSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  apiEndpoint: z.string().url('Must be a valid URL'),
  callbackUrl: z.string().url('Must be a valid URL'),
  environment: z.enum(['sandbox', 'production']),
  consentEnabled: z.boolean().default(true),
  consentDuration: z.number().int().min(1, 'Consent duration must be at least 1 day'),
  consentTemplate: z.string().min(10, 'Consent template is required')
})

type ABDMSettingsForm = z.infer<typeof abdmSettingsSchema>

export default function ABDMIntegrationPage() {
  const [settings, setSettings] = useState<ABDMSettings>({
    enabled: false,
    clientId: '',
    clientSecret: '',
    apiEndpoint: 'https://dev.abdm.gov.in/gateway',
    callbackUrl: `${window.location.origin}/api/abdm/callback`,
    environment: 'sandbox',
    consentEnabled: true,
    consentDuration: 30,
    consentTemplate: `I, {{patient_name}}, hereby grant consent to {{hospital_name}} to access my health records through the Ayushman Bharat Digital Mission (ABDM) for the purpose of {{purpose}}.

This consent is valid from {{valid_from}} to {{valid_until}}.

I understand that I can revoke this consent at any time through the ABDM portal or by contacting the hospital directly.`
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [consents, setConsents] = useState<ABDMConsent[]>([])
  const [linkedPatients, setLinkedPatients] = useState<ABDMLinkedPatient[]>([])
  const [activeTab, setActiveTab] = useState('settings')
  const [searchQuery, setSearchQuery] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null)
  
  const { hospitalId } = useAuth()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ABDMSettingsForm>({
    resolver: zodResolver(abdmSettingsSchema),
    defaultValues: settings
  })

  // Load settings and data
  useEffect(() => {
    if (hospitalId) {
      loadSettings()
      loadConsents()
      loadLinkedPatients()
    }
  }, [hospitalId])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // In a real implementation, this would load from database
      // For now, we'll use the default settings
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form with loaded settings
      reset(settings)
    } catch (error) {
      console.error('Error loading ABDM settings:', error)
      toast.error("Failed to load ABDM settings", {
        description: "Could not retrieve configuration"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadConsents = async () => {
    try {
      // Mock data - in real implementation, would load from database
      const mockConsents: ABDMConsent[] = [
        {
          id: '1',
          patient_id: 'patient-1',
          consent_id: 'CONSENT-001',
          consent_status: 'GRANTED',
          data_access_level: 'FULL',
          valid_from: '2024-01-01T00:00:00Z',
          valid_until: '2024-12-31T23:59:59Z',
          created_at: '2024-01-01T10:30:00Z',
          patients: {
            personal_info: {
              first_name: 'Rajesh',
              last_name: 'Kumar'
            },
            uhid: 'UH001234'
          }
        },
        {
          id: '2',
          patient_id: 'patient-2',
          consent_id: 'CONSENT-002',
          consent_status: 'REQUESTED',
          data_access_level: 'PARTIAL',
          valid_from: '2024-01-15T00:00:00Z',
          valid_until: '2024-02-15T23:59:59Z',
          created_at: '2024-01-15T14:20:00Z',
          patients: {
            personal_info: {
              first_name: 'Priya',
              last_name: 'Singh'
            },
            uhid: 'UH001235'
          }
        },
        {
          id: '3',
          patient_id: 'patient-3',
          consent_id: 'CONSENT-003',
          consent_status: 'DENIED',
          data_access_level: 'SUMMARY',
          valid_from: '2024-01-10T00:00:00Z',
          valid_until: '2024-02-10T23:59:59Z',
          created_at: '2024-01-10T09:15:00Z',
          patients: {
            personal_info: {
              first_name: 'Amit',
              last_name: 'Verma'
            },
            uhid: 'UH001236'
          }
        }
      ]
      
      setConsents(mockConsents)
    } catch (error) {
      console.error('Error loading ABDM consents:', error)
    }
  }

  const loadLinkedPatients = async () => {
    try {
      // Mock data - in real implementation, would load from database
      const mockLinkedPatients: ABDMLinkedPatient[] = [
        {
          id: 'patient-1',
          patient_id: 'PAT001',
          uhid: 'UH001234',
          abha_id: 'rajesh@abdm',
          abha_number: '1234-5678-9012',
          linked_at: '2024-01-01T10:30:00Z',
          personal_info: {
            first_name: 'Rajesh',
            last_name: 'Kumar',
            gender: 'Male',
            age: 45
          }
        },
        {
          id: 'patient-4',
          patient_id: 'PAT004',
          uhid: 'UH001237',
          abha_id: 'sunita@abdm',
          abha_number: '9876-5432-1098',
          linked_at: '2024-01-05T11:45:00Z',
          personal_info: {
            first_name: 'Sunita',
            last_name: 'Devi',
            gender: 'Female',
            age: 38
          }
        }
      ]
      
      setLinkedPatients(mockLinkedPatients)
    } catch (error) {
      console.error('Error loading linked patients:', error)
    }
  }

  // Save settings
  const onSubmit = async (data: ABDMSettingsForm) => {
    setIsSaving(true)
    try {
      // In a real implementation, this would save to database
      console.log('Saving ABDM settings:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update local state
      setSettings(data)
      
      toast.success("Settings Saved", {
        description: "ABDM integration settings have been saved successfully"
      })
    } catch (error: any) {
      console.error('Error saving ABDM settings:', error)
      toast.error("Failed to save settings", {
        description: error.message || "An unexpected error occurred"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Verify API connection
  const verifyConnection = async () => {
    setIsVerifying(true)
    setVerificationStatus(null)
    
    try {
      // In a real implementation, this would verify the connection to ABDM
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Randomly succeed or fail for demo purposes
      const success = Math.random() > 0.3
      
      if (success) {
        setVerificationStatus('success')
        toast.success("Connection Verified", {
          description: "Successfully connected to ABDM API"
        })
      } else {
        setVerificationStatus('error')
        throw new Error("Failed to connect to ABDM API. Please check your credentials.")
      }
    } catch (error: any) {
      console.error('Error verifying ABDM connection:', error)
      setVerificationStatus('error')
      toast.error("Verification Failed", {
        description: error.message || "Failed to connect to ABDM API"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  // Request consent
  const requestConsent = async (patientId: string) => {
    try {
      // In a real implementation, this would call ABDM API
      toast.success("Consent Requested", {
        description: "Consent request has been sent to the patient"
      })
    } catch (error: any) {
      console.error('Error requesting consent:', error)
      toast.error("Request Failed", {
        description: error.message || "Failed to request consent"
      })
    }
  }

  // Revoke consent
  const revokeConsent = async (consentId: string) => {
    if (!confirm('Are you sure you want to revoke this consent?')) return
    
    try {
      // In a real implementation, this would call ABDM API
      // Update local state
      setConsents(consents.map(consent => 
        consent.consent_id === consentId 
          ? { ...consent, consent_status: 'REVOKED' } 
          : consent
      ))
      
      toast.success("Consent Revoked", {
        description: "Consent has been revoked successfully"
      })
    } catch (error: any) {
      console.error('Error revoking consent:', error)
      toast.error("Revocation Failed", {
        description: error.message || "Failed to revoke consent"
      })
    }
  }

  // Unlink patient
  const unlinkPatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to unlink this patient from ABDM?')) return
    
    try {
      // In a real implementation, this would call ABDM API
      // Update local state
      setLinkedPatients(linkedPatients.filter(patient => patient.id !== patientId))
      
      toast.success("Patient Unlinked", {
        description: "Patient has been unlinked from ABDM successfully"
      })
    } catch (error: any) {
      console.error('Error unlinking patient:', error)
      toast.error("Unlink Failed", {
        description: error.message || "Failed to unlink patient from ABDM"
      })
    }
  }

  // Filter linked patients
  const getFilteredPatients = () => {
    if (!searchQuery) return linkedPatients
    
    return linkedPatients.filter(patient => {
      const fullName = `${patient.personal_info.first_name} ${patient.personal_info.last_name}`.toLowerCase()
      const searchTerm = searchQuery.toLowerCase()
      
      return (
        fullName.includes(searchTerm) ||
        patient.uhid.toLowerCase().includes(searchTerm) ||
        patient.abha_id.toLowerCase().includes(searchTerm) ||
        patient.abha_number.includes(searchTerm)
      )
    })
  }

  // Get consent status badge color
  const getConsentStatusColor = (status: string) => {
    switch (status) {
      case 'GRANTED': return 'bg-green-100 text-green-800'
      case 'REQUESTED': return 'bg-blue-100 text-blue-800'
      case 'DENIED': return 'bg-red-100 text-red-800'
      case 'REVOKED': return 'bg-orange-100 text-orange-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get access level badge color
  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'FULL': return 'bg-purple-100 text-purple-800'
      case 'PARTIAL': return 'bg-blue-100 text-blue-800'
      case 'SUMMARY': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ABDM Integration
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure Ayushman Bharat Digital Mission integration settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            API Settings
          </TabsTrigger>
          <TabsTrigger value="consents">
            <Shield className="w-4 h-4 mr-2" />
            Consent Management
          </TabsTrigger>
          <TabsTrigger value="patients">
            <QrCode className="w-4 h-4 mr-2" />
            Linked Patients
          </TabsTrigger>
        </TabsList>

        {/* API Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>ABDM API Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure API credentials and endpoints for ABDM integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-medical-600" />
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="enabled"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="abdm-enabled"
                          />
                        )}
                      />
                      <Label htmlFor="abdm-enabled" className="font-medium">
                        Enable ABDM Integration
                      </Label>
                    </div>
                    
                    <Badge variant={settings.environment === 'production' ? 'default' : 'outline'}>
                      {settings.environment === 'production' ? 'Production' : 'Sandbox'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientId">Client ID *</Label>
                      <Input
                        id="clientId"
                        {...register('clientId')}
                        placeholder="Enter ABDM Client ID"
                        type="password"
                      />
                      {errors.clientId && (
                        <p className="text-sm text-red-600 mt-1">{errors.clientId.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="clientSecret">Client Secret *</Label>
                      <Input
                        id="clientSecret"
                        {...register('clientSecret')}
                        placeholder="Enter ABDM Client Secret"
                        type="password"
                      />
                      {errors.clientSecret && (
                        <p className="text-sm text-red-600 mt-1">{errors.clientSecret.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apiEndpoint">API Endpoint *</Label>
                      <Input
                        id="apiEndpoint"
                        {...register('apiEndpoint')}
                        placeholder="Enter ABDM API Endpoint"
                      />
                      {errors.apiEndpoint && (
                        <p className="text-sm text-red-600 mt-1">{errors.apiEndpoint.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="callbackUrl">Callback URL *</Label>
                      <Input
                        id="callbackUrl"
                        {...register('callbackUrl')}
                        placeholder="Enter Callback URL"
                      />
                      {errors.callbackUrl && (
                        <p className="text-sm text-red-600 mt-1">{errors.callbackUrl.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="environment">Environment *</Label>
                      <Controller
                        name="environment"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select environment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                              <SelectItem value="production">Production</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.environment && (
                        <p className="text-sm text-red-600 mt-1">{errors.environment.message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={verifyConnection}
                        disabled={isVerifying}
                        className="w-full"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            {verificationStatus === 'success' ? (
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            ) : verificationStatus === 'error' ? (
                              <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                            ) : (
                              <Key className="w-4 h-4 mr-2" />
                            )}
                            Verify Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="consentEnabled"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="consent-enabled"
                            />
                          )}
                        />
                        <Label htmlFor="consent-enabled" className="font-medium">
                          Enable Consent Management
                        </Label>
                      </div>
                      
                      <div>
                        <Label htmlFor="consentDuration" className="mr-2">Consent Duration (days)</Label>
                        <Input
                          id="consentDuration"
                          type="number"
                          min="1"
                          max="365"
                          {...register('consentDuration', { valueAsNumber: true })}
                          className="w-20 inline-block"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="consentTemplate">Consent Template *</Label>
                      <Textarea
                        id="consentTemplate"
                        {...register('consentTemplate')}
                        placeholder="Enter consent template"
                        rows={6}
                      />
                      {errors.consentTemplate && (
                        <p className="text-sm text-red-600 mt-1">{errors.consentTemplate.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Use placeholders like {{patient_name}}, {{hospital_name}}, {{purpose}}, {{valid_from}}, and {{valid_until}}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => reset(settings)}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-medical-600 hover:bg-medical-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Documentation & Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a 
                    href="https://sandbox.abdm.gov.in/docs/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">ABDM Sandbox Documentation</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Official documentation for ABDM sandbox environment
                    </p>
                  </a>
                  
                  <a 
                    href="https://abdm.gov.in/publications/guidelines" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">ABDM Guidelines</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Official guidelines and policies for ABDM integration
                    </p>
                  </a>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-medium">Important Note</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    ABDM integration requires proper registration and approval from the National Health Authority (NHA).
                    Please ensure you have completed the registration process before enabling this integration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Management Tab */}
        <TabsContent value="consents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Consent Management</span>
              </CardTitle>
              <CardDescription>
                Manage patient consents for data sharing through ABDM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search consents..."
                      className="w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button variant="outline" onClick={loadConsents}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Patient</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Consent ID</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Access Level</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Valid Period</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No consent records found
                          </td>
                        </tr>
                      ) : (
                        consents.map((consent) => (
                          <tr key={consent.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">
                                  {consent.patients.personal_info.first_name} {consent.patients.personal_info.last_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {consent.patients.uhid}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{consent.consent_id}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={getConsentStatusColor(consent.consent_status)}>
                                {consent.consent_status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={getAccessLevelColor(consent.data_access_level)}>
                                {consent.data_access_level}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <p>From: {new Date(consent.valid_from).toLocaleDateString()}</p>
                                <p>To: {new Date(consent.valid_until).toLocaleDateString()}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end space-x-2">
                                {consent.consent_status === 'GRANTED' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => revokeConsent(consent.consent_id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Revoke
                                  </Button>
                                )}
                                {consent.consent_status === 'REQUESTED' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => requestConsent(consent.patient_id)}
                                  >
                                    Remind
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Request New Consent</span>
              </CardTitle>
              <CardDescription>
                Request consent from a patient for data sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patientSearch">Patient</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="patientSearch"
                        placeholder="Search by UHID or name"
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="accessLevel">Access Level</Label>
                    <Select defaultValue="SUMMARY">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUMMARY">Summary</SelectItem>
                        <SelectItem value="PARTIAL">Partial</SelectItem>
                        <SelectItem value="FULL">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input
                      id="purpose"
                      placeholder="Enter purpose for data access"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validFrom">Valid From</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="validTo">Valid To</Label>
                      <Input
                        id="validTo"
                        type="date"
                        defaultValue={new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="consentNotes">Notes</Label>
                    <Textarea
                      id="consentNotes"
                      placeholder="Enter any additional notes"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button>
                      <Shield className="w-4 h-4 mr-2" />
                      Request Consent
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Linked Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>ABHA Linked Patients</span>
              </CardTitle>
              <CardDescription>
                Manage patients linked with ABHA ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search patients..."
                      className="w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button variant="outline" onClick={loadLinkedPatients}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Patient</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">UHID</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">ABHA ID</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">ABHA Number</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Linked On</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredPatients().length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No linked patients found
                          </td>
                        </tr>
                      ) : (
                        getFilteredPatients().map((patient) => (
                          <tr key={patient.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">
                                  {patient.personal_info.first_name} {patient.personal_info.last_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {patient.personal_info.gender}, {patient.personal_info.age} years
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{patient.uhid}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              {patient.abha_id}
                            </td>
                            <td className="px-4 py-3">
                              {patient.abha_number}
                            </td>
                            <td className="px-4 py-3">
                              {new Date(patient.linked_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => requestConsent(patient.id)}
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Request Consent
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => unlinkPatient(patient.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Unlink className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="w-5 h-5" />
                <span>Link New Patient</span>
              </CardTitle>
              <CardDescription>
                Link a patient with their ABHA ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linkPatientSearch">Patient</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="linkPatientSearch"
                        placeholder="Search by UHID or name"
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="abhaId">ABHA ID</Label>
                    <Input
                      id="abhaId"
                      placeholder="Enter ABHA ID (e.g., username@abdm)"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="abhaNumber">ABHA Number</Label>
                    <Input
                      id="abhaNumber"
                      placeholder="Enter 14-digit ABHA Number"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Verification Method</Label>
                    <Select defaultValue="otp">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="otp">Mobile OTP</SelectItem>
                        <SelectItem value="aadhaar">Aadhaar OTP</SelectItem>
                        <SelectItem value="demographics">Demographics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <h3 className="font-medium mb-2">Verification Process</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                      <li>Enter patient details and ABHA information</li>
                      <li>Select verification method</li>
                      <li>Click "Verify & Link" to initiate verification</li>
                      <li>Complete verification process</li>
                      <li>Confirm linking after successful verification</li>
                    </ol>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button>
                      <Link className="w-4 h-4 mr-2" />
                      Verify & Link
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}