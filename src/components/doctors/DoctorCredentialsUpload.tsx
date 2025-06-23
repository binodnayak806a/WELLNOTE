import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Upload, 
  Trash2, 
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Plus
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Credential {
  id: string
  type: string
  name: string
  file: File | null
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
  uploadProgress?: number
  expiryDate?: string
}

interface DoctorCredentialsUploadProps {
  doctorId: string
  onSave: (credentials: Credential[]) => void
  onCancel: () => void
  initialCredentials?: Credential[]
}

const credentialTypes = [
  'Medical Degree',
  'Medical License',
  'Board Certification',
  'Specialty Certification',
  'Fellowship Certificate',
  'Identity Proof',
  'Address Proof',
  'Other'
]

export default function DoctorCredentialsUpload({
  doctorId,
  onSave,
  onCancel,
  initialCredentials = []
}: DoctorCredentialsUploadProps) {
  const [credentials, setCredentials] = useState<Credential[]>(
    initialCredentials.length > 0 
      ? initialCredentials 
      : [{ 
          id: crypto.randomUUID(), 
          type: 'Medical Degree', 
          name: 'Medical Degree', 
          file: null, 
          status: 'pending' 
        }]
  )
  const [uploading, setUploading] = useState(false)

  // Add new credential
  const addCredential = () => {
    setCredentials([
      ...credentials,
      {
        id: crypto.randomUUID(),
        type: 'Medical License',
        name: 'Medical License',
        file: null,
        status: 'pending'
      }
    ])
  }

  // Remove credential
  const removeCredential = (id: string) => {
    setCredentials(credentials.filter(cred => cred.id !== id))
  }

  // Update credential
  const updateCredential = (id: string, field: string, value: any) => {
    setCredentials(credentials.map(cred => 
      cred.id === id ? { ...cred, [field]: value } : cred
    ))
  }

  // Handle file selection
  const handleFileChange = (id: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File Too Large", {
          description: "File size must be less than 5MB"
        })
        return
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid File Type", {
          description: "Only PDF, JPEG, and PNG files are allowed"
        })
        return
      }
      
      updateCredential(id, 'file', file)
      updateCredential(id, 'name', file.name)
    }
  }

  // Save credentials
  const saveCredentials = async () => {
    // Validate that all credentials have files
    const missingFiles = credentials.some(cred => !cred.file && cred.status === 'pending')
    if (missingFiles) {
      toast.error("Missing Files", {
        description: "Please upload files for all credentials"
      })
      return
    }
    
    setUploading(true)
    
    try {
      // In a real implementation, you would upload the files to storage
      // and then save the metadata to the database
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update status to uploaded
      const updatedCredentials = credentials.map(cred => ({
        ...cred,
        status: cred.status === 'pending' ? 'uploaded' as const : cred.status
      }))
      
      onSave(updatedCredentials)
      
      toast.success("Credentials Uploaded", {
        description: "All credentials have been uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading credentials:', error)
      toast.error("Upload Failed", {
        description: "Failed to upload credentials. Please try again."
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Credentials & Documents
        </h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={addCredential}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Credential
        </Button>
      </div>

      <div className="space-y-4">
        {credentials.map((credential) => (
          <div key={credential.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{credential.type}</span>
                <StatusBadge status={credential.status} />
              </div>
              {credential.status === 'pending' && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeCredential(credential.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Document Type</Label>
                <Select 
                  value={credential.type} 
                  onValueChange={(value) => updateCredential(credential.id, 'type', value)}
                  disabled={credential.status !== 'pending'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {credentialTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Expiry Date (if applicable)</Label>
                <Input
                  type="date"
                  value={credential.expiryDate || ''}
                  onChange={(e) => updateCredential(credential.id, 'expiryDate', e.target.value)}
                  disabled={credential.status !== 'pending'}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label>Upload Document</Label>
              <div className="mt-2">
                {credential.status === 'pending' ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(credential.id, e.target.files)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-2 bg-gray-50 rounded border text-sm truncate">
                      {credential.name}
                    </div>
                    <Button type="button" variant="outline" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {credential.status === 'rejected' && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Verification Failed</p>
                    <p>Please upload a clearer document or contact administrator for assistance.</p>
                  </div>
                </div>
              )}
              
              {credential.status === 'verified' && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Verification Successful</p>
                    <p>This document has been verified and approved.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={uploading}
        >
          Cancel
        </Button>
        
        <Button
          type="button"
          onClick={saveCredentials}
          disabled={uploading || credentials.length === 0}
          className="bg-medical-600 hover:bg-medical-700"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Credentials
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Status Badge component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'uploaded':
      return <Badge className="bg-blue-100 text-blue-800">Uploaded</Badge>
    case 'verified':
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    default:
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
  }
}