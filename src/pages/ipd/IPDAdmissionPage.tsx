// src/pages/opd/RegisterPatientPage.tsx

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Users, ArrowLeft, Loader2 } from 'lucide-react'

// --- THIS IS THE LINE TO FIX ---
import { patientService } from '@/services' // Corrected: import from the services barrel file
// ------------------------------

const personalInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  blood_group: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
});

const contactInfoSchema = z.object({
  address_line: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  mobile: z.string().optional(),
});

const patientSchema = z.object({
  personal_info: personalInfoSchema,
  contact_info: contactInfoSchema,
  emergency_contact: emergencyContactSchema,
  // is_active is usually set by the system, not the form
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function RegisterPatientPage() {
  const [loading, setLoading] = useState(false)
  const { hospitalId } = useAuth()
  const navigate = useNavigate()

  const { control, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      personal_info: {
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        email: '',
        mobile: ''
      },
      contact_info: {
        address_line: '',
        city: '',
        state: '',
        pincode: ''
      },
      emergency_contact: {
        name: '',
        relationship: '',
        mobile: ''
      }
    }
  })

  const onSubmit = async (data: PatientFormData) => {
    if (!hospitalId) {
      toast.error('Hospital information not found. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      // In a real implementation, you would use patientService.createPatient
      console.log('Registering new patient:', data);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Patient Registered Successfully', {
        description: `Patient ${data.personal_info.first_name} has been added to the system.`
      });
      navigate('/patients');

    } catch (error: any) {
      toast.error('Registration Failed', {
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setLoading(false);
    }
  }

  const renderError = (fieldError: any) => {
    if (!fieldError) return null;
    return <p className="text-sm text-red-500 mt-1">{fieldError.message}</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Register New Patient</h1>
          <p className="text-gray-600 mt-1">Fill out the form to add a new patient to the system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details of the patient.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Controller
                    name="personal_info.first_name"
                    control={control}
                    render={({ field }) => <Input id="first_name" {...field} />}
                  />
                  {renderError(errors.personal_info?.first_name)}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Controller
                    name="personal_info.last_name"
                    control={control}
                    render={({ field }) => <Input id="last_name" {...field} />}
                  />
                  {renderError(errors.personal_info?.last_name)}
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Controller
                    name="personal_info.date_of_birth"
                    control={control}
                    render={({ field }) => <Input id="date_of_birth" type="date" {...field} />}
                  />
                  {renderError(errors.personal_info?.date_of_birth)}
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Controller
                    name="personal_info.gender"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="gender">
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
                  {renderError(errors.personal_info?.gender)}
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Controller
                    name="personal_info.mobile"
                    control={control}
                    render={({ field }) => <Input id="mobile" {...field} />}
                  />
                  {renderError(errors.personal_info?.mobile)}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Controller
                    name="personal_info.email"
                    control={control}
                    render={({ field }) => <Input id="email" type="email" {...field} />}
                  />
                  {renderError(errors.personal_info?.email)}
                </div>
                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Controller
                    name="personal_info.blood_group"
                    control={control}
                    render={({ field }) => <Input id="blood_group" {...field} />}
                  />
                  {renderError(errors.personal_info?.blood_group)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Patient's address and location.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="address_line">Address</Label>
                  <Controller
                    name="contact_info.address_line"
                    control={control}
                    render={({ field }) => <Textarea id="address_line" {...field} />}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Controller
                      name="contact_info.city"
                      control={control}
                      render={({ field }) => <Input id="city" {...field} />}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Controller
                      name="contact_info.state"
                      control={control}
                      render={({ field }) => <Input id="state" {...field} />}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Controller
                      name="contact_info.pincode"
                      control={control}
                      render={({ field }) => <Input id="pincode" {...field} />}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Contact person in case of an emergency (optional).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="emergency_name">Name</Label>
                  <Controller
                    name="emergency_contact.name"
                    control={control}
                    render={({ field }) => <Input id="emergency_name" {...field} />}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_relationship">Relationship</Label>
                  <Controller
                    name="emergency_contact.relationship"
                    control={control}
                    render={({ field }) => <Input id="emergency_relationship" {...field} />}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_mobile">Mobile Number</Label>
                  <Controller
                    name="emergency_contact.mobile"
                    control={control}
                    render={({ field }) => <Input id="emergency_mobile" {...field} />}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={loading} className="bg-medical-600 hover:bg-medical-700 w-48">
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              'Register Patient'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}