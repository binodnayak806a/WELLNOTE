// import React, { useState, useEffect } from 'react'
// import { useForm, Controller, useFieldArray } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { useNavigate } from 'react-router-dom'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Textarea } from '@/components/ui/textarea'
// import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
// import { 
//   TestTube, 
//   User, 
//   Calendar, 
//   Clock, 
//   Plus, 
//   Trash2, 
//   Save,
//   Search,
//   Microscope,
//   Loader2,
//   AlertTriangle,
//   UserCheck,
//   Building2
// } from 'lucide-react'
// import { toast } from 'sonner'
// import { useAuth } from '@/hooks/useAuth'
// import { patientService, doctorService, departmentService } from '@/services/supabaseClient'

// // Types
// interface Patient {
//   id: string
//   patient_id: string
//   uhid: string
//   personal_info: any
//   contact_info: any
// }

// interface Doctor {
//   id: string
//   employee_id: string
//   personal_info: any
//   users: {
//     full_name: string
//   }
//   departments: {
//     name: string
//   }
// }

// interface Department {
//   id: string
//   name: string
//   code: string
// }

// interface Test {
//   id: string
//   test_code: string
//   test_name: string
//   category: string
//   sample_type: string
//   cost: number
//   duration_hours: number
//   preparation_instructions?: string
// }

// // Validation schema
// const testOrderSchema = z.object({
//   patientId: z.string().min(1, 'Patient selection is required'),
//   orderDate: z.string().min(1, 'Order date is required'),
//   orderTime: z.string().min(1, 'Order time is required'),
//   referringDoctorId: z.string().min(1, 'Referring doctor is required'),
//   departmentId: z.string().min(1, 'Department is required'),
//   orderType: z.enum(['routine', 'urgent', 'stat'], {
//     required_error: 'Please select order type'
//   }),
//   clinicalNotes: z.string().optional(),
//   tests: z.array(z.object({
//     testId: z.string().min(1, 'Test selection is required'),
//     testName: z.string().min(1, 'Test name is required'),
//     sampleType: z.string().min(1, 'Sample type is required'),
//     cost: z.number().min(0, 'Cost must be positive'),
//     isUrgent: z.boolean().default(false)
//   })).min(1, 'At least one test is required'),
//   patientPreparation: z.string().optional(),
//   isFasting: z.boolean().default(false),
//   paymentStatus: z.enum(['pending', 'paid', 'insurance'], {
//     required_error: 'Please select payment status'
//   })
// })

// type TestOrderForm = z.infer<typeof testOrderSchema>

// // Mock data for tests
// const mockTests: Test[] = [
//   { id: '1', test_code: 'CBC', test_name: 'Complete Blood Count', category: 'Hematology', sample_type: 'Blood', cost: 300, duration_hours: 4 },
//   { id: '2', test_code: 'LFT', test_name: 'Liver Function Test', category: 'Biochemistry', sample_type: 'Blood', cost: 500, duration_hours: 6 },
//   { id: '3', test_code: 'KFT', test_name: 'Kidney Function Test', category: 'Biochemistry', sample_type: 'Blood', cost: 500, duration_hours: 6 },
//   { id: '4', test_code: 'TFT', test_name: 'Thyroid Function Test', category: 'Endocrinology', sample_type: 'Blood', cost: 600, duration_hours: 8 },
//   { id: '5', test_code: 'LIPID', test_name: 'Lipid Profile', category: 'Biochemistry', sample_type: 'Blood', cost: 400, duration_hours: 6 },
//   { id: '6', test_code: 'GLUC', test_name: 'Blood Glucose', category: 'Biochemistry', sample_type: 'Blood', cost: 150, duration_hours: 2 },
//   { id: '7', test_code: 'HBA1C', test_name: 'Glycated Hemoglobin', category: 'Endocrinology', sample_type: 'Blood', cost: 450, duration_hours: 8 },
//   { id: '8', test_code: 'URINE', test_name: 'Urine Routine', category: 'Microbiology', sample_type: 'Urine', cost: 200, duration_hours: 4 },
//   { id: '9', test_code: 'CULT', test_name: 'Culture & Sensitivity', category: 'Microbiology', sample_type: 'Various', cost: 800, duration_hours: 72 },
//   { id: '10', test_code: 'XRAY', test_name: 'X-Ray Chest', category: 'Radiology', sample_type: 'N/A', cost: 500, duration_hours: 2 }
// ]

// export default function TestOrderPage() {
//   const [isLoading, setIsLoading] = useState(false)
//   const [patients, setPatients] = useState<Patient[]>([])
//   const [doctors, setDoctors] = useState<Doctor[]>([])
//   const [departments, setDepartments] = useState<Department[]>([])
//   const [tests, setTests] = useState<Test[]>(mockTests)
//   const [patientSearchQuery, setPatientSearchQuery] = useState('')
//   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
//   const [testSearchQuery, setTestSearchQuery] = useState('')
//   const [filteredTests, setFilteredTests] = useState<Test[]>(tests)
  
//   const { hospitalId, user } = useAuth()
//   const navigate = useNavigate()

//   const {
//     register,
//     handleSubmit,
//     control,
//     watch,
//     setValue,
//     reset,
//     formState: { errors, isSubmitting }
//   } = useForm<TestOrderForm>({
//     resolver: zodResolver(testOrderSchema),
//     defaultValues: {
//       orderDate: new Date().toISOString().split('T')[0],
//       orderTime: new Date().toTimeString().slice(0, 5),
//       orderType: 'routine',
//       tests: [{
//         testId: '',
//         testName: '',
//         sampleType: '',
//         cost: 0,
//         isUrgent: false
//       }],
//       isFasting: false,
//       paymentStatus: 'pending'
//     }
//   })

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'tests'
//   })

//   const watchTests = watch('tests')
//   const watchOrderType = watch('orderType')

//   // Load initial data
//   useEffect(() => {
//     if (hospitalId) {
//       loadInitialData()
//     }
//   }, [hospitalId])

//   // Filter tests when search query changes
//   useEffect(() => {
//     if (testSearchQuery) {
//       const filtered = tests.filter(test => 
//         test.test_name.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
//         test.test_code.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
//         test.category.toLowerCase().includes(testSearchQuery.toLowerCase())
//       )
//       setFilteredTests(filtered)
//     } else {
//       setFilteredTests(tests)
//     }
//   }, [testSearchQuery, tests])

//   const loadInitialData = async () => {
//     setIsLoading(true)
//     try {
//       await Promise.all([
//         loadPatients(),
//         loadDoctors(),
//         loadDepartments()
//       ])
//     } catch (error) {
//       console.error('Error loading initial data:', error)
//       toast.error("Failed to load data", {
//         description: "Could not retrieve necessary information"
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const loadPatients = async () => {
//     if (!hospitalId) return

//     try {
//       const result = await patientService.getPatients(hospitalId)
//       if (result.success) {
//         setPatients(result.data || [])
//       }
//     } catch (error) {
//       console.error('Error loading patients:', error)
//     }
//   }

//   const loadDoctors = async () => {
//     if (!hospitalId) return

//     try {
//       const result = await doctorService.getDoctors(hospitalId)
//       if (result.success) {
//         setDoctors(result.data || [])
//       }
//     } catch (error) {
//       console.error('Error loading doctors:', error)
//     }
//   }

//   const loadDepartments = async () => {
//     if (!hospitalId) return

//     try {
//       const result = await departmentService.getDepartments(hospitalId)
//       if (result.success) {
//         setDepartments(result.data || [])
//       }
//     } catch (error) {
//       console.error('Error loading departments:', error)
//     }
//   }

//   // Search patients
//   const searchPatients = (query: string) => {
//     if (!query.trim()) return patients.slice(0, 10)
    
//     return patients.filter(patient => {
//       const personalInfo = patient.personal_info || {}
//       const fullName = `${personalInfo.first_name || ''} ${personalInfo.last_name || ''}`.toLowerCase()
//       const searchTerm = query.toLowerCase()
      
//       return (
//         patient.patient_id.toLowerCase().includes(searchTerm) ||
//         patient.uhid.toLowerCase().includes(searchTerm) ||
//         fullName.includes(searchTerm) ||
//         (personalInfo.mobile && personalInfo.mobile.includes(query))
//       )
//     }).slice(0, 10)
//   }

//   // Add test to order
//   const addTest = (test: Test) => {
//     append({
//       testId: test.id,
//       testName: test.test_name,
//       sampleType: test.sample_type,
//       cost: test.cost,
//       isUrgent: watchOrderType === 'stat' || watchOrderType === 'urgent'
//     })
//     setTestSearchQuery('')
//   }

//   // Calculate total cost
//   const calculateTotalCost = () => {
//     return watchTests.reduce((sum, test) => sum + test.cost, 0)
//   }

//   // Submit form
//   const onSubmit = async (data: TestOrderForm) => {
//     if (!hospitalId || !user) {
//       toast.error("Error", {
//         description: "Hospital ID or user not found"
//       })
//       return
//     }

//     try {
//       // In a real implementation, this would save to the database
//       console.log('Test order data:', data)
      
//       toast.success("Test Order Created", {
//         description: "Laboratory test order has been created successfully"
//       })

//       // Reset form
//       reset()
//       setSelectedPatient(null)
//       setPatientSearchQuery('')

//       // Navigate to lab dashboard
//       setTimeout(() => {
//         navigate('/laboratory')
//       }, 2000)

//     } catch (error: any) {
//       console.error('Test order error:', error)
//       toast.error("Order Failed", {
//         description: error.message || "An unexpected error occurred"
//       })
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
//           <p>Loading test order data...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto p-6 max-w-6xl">
//       {/* Page Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//           Create Test Order
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-2">
//           Order laboratory tests and diagnostic procedures
//         </p>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Patient Selection */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <User className="w-5 h-5" />
//               <span>Patient Information</span>
//             </CardTitle>
//             <CardDescription>
//               Search and select patient for test order
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="patientSearch">Patient *</Label>
//               <div className="space-y-2">
//                 <Input
//                   placeholder="Search by UHID, Name, or Mobile"
//                   value={patientSearchQuery}
//                   onChange={(e) => setPatientSearchQuery(e.target.value)}
//                 />
                
//                 {patientSearchQuery && (
//                   <div className="border rounded-md max-h-40 overflow-y-auto">
//                     {searchPatients(patientSearchQuery).map((patient) => (
//                       <div
//                         key={patient.id}
//                         className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
//                         onClick={() => {
//                           setValue('patientId', patient.id)
//                           setSelectedPatient(patient)
//                           setPatientSearchQuery(`${patient.personal_info?.first_name} ${patient.personal_info?.last_name} (${patient.uhid})`)
//                         }}
//                       >
//                         <p className="font-medium">
//                           {patient.personal_info?.first_name} {patient.personal_info?.last_name}
//                         </p>
//                         <p className="text-sm text-gray-600">UHID: {patient.uhid}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {selectedPatient && (
//                   <div className="p-3 bg-medical-50 border border-medical-200 rounded-md">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-medical-800">
//                           Selected: {selectedPatient.personal_info?.first_name} {selectedPatient.personal_info?.last_name}
//                         </p>
//                         <p className="text-sm text-medical-600">UHID: {selectedPatient.uhid}</p>
//                       </div>
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedPatient(null)
//                           setPatientSearchQuery('')
//                           setValue('patientId', '')
//                         }}
//                       >
//                         Clear
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               {errors.patientId && (
//                 <p className="text-sm text-red-600 mt-1">{errors.patientId.message}</p>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Order Details */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <Calendar className="w-5 h-5" />
//               <span>Order Details</span>
//             </CardTitle>
//             <CardDescription>
//               Date, time, and order information
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <Label htmlFor="orderDate">Order Date *</Label>
//                 <Input
//                   id="orderDate"
//                   type="date"
//                   {...register('orderDate')}
//                 />
//                 {errors.orderDate && (
//                   <p className="text-sm text-red-600 mt-1">{errors.orderDate.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="orderTime">Order Time *</Label>
//                 <Input
//                   id="orderTime"
//                   type="time"
//                   {...register('orderTime')}
//                 />
//                 {errors.orderTime && (
//                   <p className="text-sm text-red-600 mt-1">{errors.orderTime.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="orderType">Order Type *</Label>
//                 <Controller
//                   name="orderType"
//                   control={control}
//                   render={({ field }) => (
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select order type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="routine">Routine</SelectItem>
//                         <SelectItem value="urgent">Urgent</SelectItem>
//                         <SelectItem value="stat">STAT (Emergency)</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.orderType && (
//                   <p className="text-sm text-red-600 mt-1">{errors.orderType.message}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="referringDoctorId">Referring Doctor *</Label>
//                 <Controller
//                   name="referringDoctorId"
//                   control={control}
//                   render={({ field }) => (
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select referring doctor" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {doctors.map((doctor) => (
//                           <SelectItem key={doctor.id} value={doctor.id}>
//                             Dr. {doctor.users?.full_name} - {doctor.departments?.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.referringDoctorId && (
//                   <p className="text-sm text-red-600 mt-1">{errors.referringDoctorId.message}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="departmentId">Department *</Label>
//                 <Controller
//                   name="departmentId"
//                   control={control}
//                   render={({ field }) => (
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select department" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {departments.map((department) => (
//                           <SelectItem key={department.id} value={department.id}>
//                             {department.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//                 {errors.departmentId && (
//                   <p className="text-sm text-red-600 mt-1">{errors.departmentId.message}</p>
//                 )}
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="clinicalNotes">Clinical Notes</Label>
//               <Textarea
//                 id="clinicalNotes"
//                 {...register('clinicalNotes')}
//                 placeholder="Enter clinical notes or diagnosis"
//                 rows={3}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Test Selection */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <TestTube className="w-5 h-5" />
//               <span>Test Selection</span>
//             </CardTitle>
//             <CardDescription>
//               Select tests to be performed
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label>Search Tests</Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <Input
//                   placeholder="Search tests by name or code..."
//                   value={testSearchQuery}
//                   onChange={(e) => setTestSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
              
//               {testSearchQuery && (
//                 <div className="border rounded-md mt-2 max-h-60 overflow-y-auto">
//                   {filteredTests.length > 0 ? (
//                     filteredTests.map((test) => (
//                       <div
//                         key={test.id}
//                         className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
//                         onClick={() => addTest(test)}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="font-medium">{test.test_name}</p>
//                             <p className="text-sm text-gray-600">
//                               {test.test_code} | {test.category} | Sample: {test.sample_type}
//                             </p>
//                           </div>
//                           <Badge>₹{test.cost}</Badge>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="p-3 text-center text-gray-500">
//                       No tests found matching "{testSearchQuery}"
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label>Selected Tests</Label>
//                 <div className="text-sm text-gray-600">
//                   Total: ₹{calculateTotalCost()}
//                 </div>
//               </div>
              
//               {fields.length === 0 ? (
//                 <div className="text-center py-8 border rounded-lg">
//                   <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-500">No tests selected</p>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Search and select tests from above
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {fields.map((field, index) => (
//                     <div key={field.id} className="p-3 border rounded-lg">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-2">
//                           <TestTube className="w-4 h-4 text-medical-600" />
//                           <p className="font-medium">
//                             {watchTests[index].testName}
//                           </p>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => remove(index)}
//                           className="text-red-600 hover:text-red-700"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
                      
//                       <div className="grid grid-cols-2 gap-2 mt-2">
//                         <div className="text-sm text-gray-600">
//                           Sample: {watchTests[index].sampleType}
//                         </div>
//                         <div className="text-sm text-gray-600 text-right">
//                           Cost: ₹{watchTests[index].cost}
//                         </div>
//                       </div>
                      
//                       <div className="mt-2 flex items-center space-x-2">
//                         <Controller
//                           name={`tests.${index}.isUrgent`}
//                           control={control}
//                           render={({ field }) => (
//                             <Checkbox
//                               id={`tests.${index}.isUrgent`}
//                               checked={field.value}
//                               onCheckedChange={field.onChange}
//                             />
//                           )}
//                         />
//                         <Label htmlFor={`tests.${index}.isUrgent`} className="text-sm">
//                           Mark as Urgent
//                         </Label>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
              
//               {errors.tests && (
//                 <p className="text-sm text-red-600 mt-1">{errors.tests.message}</p>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Additional Information */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <Microscope className="w-5 h-5" />
//               <span>Additional Information</span>
//             </CardTitle>
//             <CardDescription>
//               Sample collection and payment details
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <Label htmlFor="patientPreparation">Patient Preparation</Label>
//               <Textarea
//                 id="patientPreparation"
//                 {...register('patientPreparation')}
//                 placeholder="Enter any preparation instructions for the patient"
//                 rows={3}
//               />
//             </div>

//             <div className="flex items-center space-x-2">
//               <Controller
//                 name="isFasting"
//                 control={control}
//                 render={({ field }) => (
//                   <Checkbox
//                     id="isFasting"
//                     checked={field.value}
//                     onCheckedChange={field.onChange}
//                   />
//                 )}
//               />
//               <Label htmlFor="isFasting">Fasting Required</Label>
//             </div>

//             <Separator />

//             <div>
//               <Label htmlFor="paymentStatus">Payment Status *</Label>
//               <Controller
//                 name="paymentStatus"
//                 control={control}
//                 render={({ field }) => (
//                   <Select onValueChange={field.onChange} value={field.value}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select payment status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="paid">Paid</SelectItem>
//                       <SelectItem value="insurance">Insurance</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.paymentStatus && (
//                 <p className="text-sm text-red-600 mt-1">{errors.paymentStatus.message}</p>
//               )}
//             </div>

//             {watchOrderType === 'stat' && (
//               <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//                 <div className="flex items-center space-x-2 text-red-700">
//                   <AlertTriangle className="w-5 h-5" />
//                   <span className="font-medium">STAT Order</span>
//                 </div>
//                 <p className="text-sm text-red-600 mt-1">
//                   This is a STAT (emergency) order. Results will be prioritized and communicated immediately.
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Form Actions */}
//         <div className="flex justify-end space-x-4">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => reset()}
//             disabled={isSubmitting}
//           >
//             Reset Form
//           </Button>
          
//           <Button
//             type="submit"
//             disabled={isSubmitting || fields.length === 0}
//             className="bg-medical-600 hover:bg-medical-700"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Creating Order...
//               </>
//             ) : (
//               <>
//                 <Save className="w-4 h-4 mr-2" />
//                 Create Test Order
//               </>
//             )}
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }

// src/pages/lab/TestOrderPage.tsx

import React, { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  TestTube, 
  User, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  Search,
  Microscope,
  Loader2,
  AlertTriangle,
  UserCheck,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
// --- THIS IS THE LINE TO FIX ---
import { patientService, doctorService, departmentService } from '@/services' // Corrected: import from the services barrel file
// ------------------------------

// Types
interface Patient {
  id: string
  patient_id: string
  uhid: string
  personal_info: any
  contact_info: any
}

interface Doctor {
  id: string
  employee_id: string
  personal_info: any
  users: {
    full_name: string
  }
  departments: {
    name: string
    id: string;
  }
}

interface Department {
  id: string
  name: string
  code: string
}

interface Test {
  id: string
  test_code: string
  test_name: string
  category: string
  sample_type: string
  cost: number
  duration_hours: number
  preparation_instructions?: string
}

// Validation schema
const testOrderSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  orderTime: z.string().min(1, 'Order time is required'),
  referringDoctorId: z.string().min(1, 'Referring doctor is required'),
  departmentId: z.string().min(1, 'Department is required'),
  orderType: z.enum(['routine', 'urgent', 'stat'], {
    required_error: 'Please select order type'
  }),
  clinicalNotes: z.string().optional(),
  tests: z.array(z.object({
    testId: z.string().min(1, 'Test selection is required'),
    testName: z.string().min(1, 'Test name is required'),
    sampleType: z.string().min(1, 'Sample type is required'),
    cost: z.number().min(0, 'Cost must be positive'),
    isUrgent: z.boolean().default(false)
  })).min(1, 'At least one test is required'),
  patientPreparation: z.string().optional(),
  isFasting: z.boolean().default(false),
  paymentStatus: z.enum(['pending', 'paid', 'insurance'], {
    required_error: 'Please select payment status'
  })
})

type TestOrderForm = z.infer<typeof testOrderSchema>

// Mock data for tests
const mockTests: Test[] = [
  { id: '1', test_code: 'CBC', test_name: 'Complete Blood Count', category: 'Hematology', sample_type: 'Blood', cost: 300, duration_hours: 4 },
  { id: '2', test_code: 'LFT', test_name: 'Liver Function Test', category: 'Biochemistry', sample_type: 'Blood', cost: 500, duration_hours: 6 },
  { id: '3', test_code: 'KFT', test_name: 'Kidney Function Test', category: 'Biochemistry', sample_type: 'Blood', cost: 500, duration_hours: 6 },
  { id: '4', test_code: 'TFT', test_name: 'Thyroid Function Test', category: 'Endocrinology', sample_type: 'Blood', cost: 600, duration_hours: 8 },
  { id: '5', test_code: 'LIPID', test_name: 'Lipid Profile', category: 'Biochemistry', sample_type: 'Blood', cost: 400, duration_hours: 6 },
  { id: '6', test_code: 'GLUC', test_name: 'Blood Glucose', category: 'Biochemistry', sample_type: 'Blood', cost: 150, duration_hours: 2 },
  { id: '7', test_code: 'HBA1C', test_name: 'Glycated Hemoglobin', category: 'Endocrinology', sample_type: 'Blood', cost: 450, duration_hours: 8 },
  { id: '8', test_code: 'URINE', test_name: 'Urine Routine', category: 'Microbiology', sample_type: 'Urine', cost: 200, duration_hours: 4 },
  { id: '9', test_code: 'CULT', test_name: 'Culture & Sensitivity', category: 'Microbiology', sample_type: 'Various', cost: 800, duration_hours: 72 },
  { id: '10', test_code: 'XRAY', test_name: 'X-Ray Chest', category: 'Radiology', sample_type: 'N/A', cost: 500, duration_hours: 2 }
]

export default function TestOrderPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [tests, setTests] = useState<Test[]>(mockTests)
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [testSearchQuery, setTestSearchQuery] = useState('')
  const [filteredTests, setFilteredTests] = useState<Test[]>(tests)
  
  const { hospitalId, user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TestOrderForm>({
    resolver: zodResolver(testOrderSchema),
    defaultValues: {
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toTimeString().slice(0, 5),
      orderType: 'routine',
      tests: [{
        testId: '',
        testName: '',
        sampleType: '',
        cost: 0,
        isUrgent: false
      }],
      isFasting: false,
      paymentStatus: 'pending'
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tests'
  })

  const watchTests = watch('tests')
  const watchOrderType = watch('orderType')

  // Load initial data
  useEffect(() => {
    if (hospitalId) {
      loadInitialData()
    }
  }, [hospitalId])

  // Filter tests when search query changes
  useEffect(() => {
    if (testSearchQuery) {
      const filtered = tests.filter(test => 
        test.test_name.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
        test.test_code.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(testSearchQuery.toLowerCase())
      )
      setFilteredTests(filtered)
    } else {
      setFilteredTests(tests)
    }
  }, [testSearchQuery, tests])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadPatients(),
        loadDoctors(),
        loadDepartments()
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error("Failed to load data", {
        description: "Could not retrieve necessary information"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadPatients = async () => {
    if (!hospitalId) return

    try {
      const result = await patientService.getPatients(hospitalId)
      if (result.success) {
        setPatients(result.data || [])
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  const loadDoctors = async () => {
    if (!hospitalId) return

    try {
      const result = await doctorService.getDoctors(hospitalId)
      if (result.success) {
        setDoctors(result.data || [])
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  const loadDepartments = async () => {
    if (!hospitalId) return

    try {
      const result = await departmentService.getDepartments(hospitalId)
      if (result.success) {
        setDepartments(result.data || [])
      }
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  // Search patients
  const searchPatients = (query: string) => {
    if (!query.trim()) return patients.slice(0, 10)
    
    return patients.filter(patient => {
      const personalInfo = patient.personal_info || {}
      const fullName = `${personalInfo.first_name || ''} ${personalInfo.last_name || ''}`.toLowerCase()
      const searchTerm = query.toLowerCase()
      
      return (
        patient.patient_id.toLowerCase().includes(searchTerm) ||
        patient.uhid.toLowerCase().includes(searchTerm) ||
        fullName.includes(searchTerm) ||
        (personalInfo.mobile && personalInfo.mobile.includes(query))
      )
    }).slice(0, 10)
  }

  // Add test to order
  const addTest = (test: Test) => {
    append({
      testId: test.id,
      testName: test.test_name,
      sampleType: test.sample_type,
      cost: test.cost,
      isUrgent: watchOrderType === 'stat' || watchOrderType === 'urgent'
    })
    setTestSearchQuery('')
  }

  // Calculate total cost
  const calculateTotalCost = () => {
    return watchTests.reduce((sum, test) => sum + test.cost, 0)
  }

  // Submit form
  const onSubmit = async (data: TestOrderForm) => {
    if (!hospitalId || !user) {
      toast.error("Error", {
        description: "Hospital ID or user not found"
      })
      return
    }

    try {
      // In a real implementation, this would save to the database
      console.log('Test order data:', data)
      
      toast.success("Test Order Created", {
        description: "Laboratory test order has been created successfully"
      })

      // Reset form
      reset()
      setSelectedPatient(null)
      setPatientSearchQuery('')

      // Navigate to lab dashboard
      setTimeout(() => {
        navigate('/laboratory')
      }, 2000)

    } catch (error: any) {
      console.error('Test order error:', error)
      toast.error("Order Failed", {
        description: error.message || "An unexpected error occurred"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading test order data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create Test Order
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Order laboratory tests and diagnostic procedures
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Patient Information</span>
            </CardTitle>
            <CardDescription>
              Search and select patient for test order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientSearch">Patient *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Search by UHID, Name, or Mobile"
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                />
                
                {patientSearchQuery && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {searchPatients(patientSearchQuery).map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setValue('patientId', patient.id)
                          setSelectedPatient(patient)
                          setPatientSearchQuery(`${patient.personal_info?.first_name} ${patient.personal_info?.last_name} (${patient.uhid})`)
                        }}
                      >
                        <p className="font-medium">
                          {patient.personal_info?.first_name} {patient.personal_info?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">UHID: {patient.uhid}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPatient && (
                  <div className="p-3 bg-medical-50 border border-medical-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-medical-800">
                          Selected: {selectedPatient.personal_info?.first_name} {selectedPatient.personal_info?.last_name}
                        </p>
                        <p className="text-sm text-medical-600">UHID: {selectedPatient.uhid}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(null)
                          setPatientSearchQuery('')
                          setValue('patientId', '')
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {errors.patientId && (
                <p className="text-sm text-red-600 mt-1">{errors.patientId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Order Details</span>
            </CardTitle>
            <CardDescription>
              Date, time, and order information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  {...register('orderDate')}
                />
                {errors.orderDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.orderDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="orderTime">Order Time *</Label>
                <Input
                  id="orderTime"
                  type="time"
                  {...register('orderTime')}
                />
                {errors.orderTime && (
                  <p className="text-sm text-red-600 mt-1">{errors.orderTime.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="orderType">Order Type *</Label>
                <Controller
                  name="orderType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="stat">STAT (Emergency)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.orderType && (
                  <p className="text-sm text-red-600 mt-1">{errors.orderType.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referringDoctorId">Referring Doctor *</Label>
                <Controller
                  name="referringDoctorId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select referring doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.users?.full_name} - {doctor.departments?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.referringDoctorId && (
                  <p className="text-sm text-red-600 mt-1">{errors.referringDoctorId.message}</p>
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

            <div>
              <Label htmlFor="clinicalNotes">Clinical Notes</Label>
              <Textarea
                id="clinicalNotes"
                {...register('clinicalNotes')}
                placeholder="Enter clinical notes or diagnosis"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Test Selection</span>
            </CardTitle>
            <CardDescription>
              Select tests to be performed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Search Tests</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tests by name or code..."
                  value={testSearchQuery}
                  onChange={(e) => setTestSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {testSearchQuery && (
                <div className="border rounded-md mt-2 max-h-60 overflow-y-auto">
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <div
                        key={test.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addTest(test)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{test.test_name}</p>
                            <p className="text-sm text-gray-600">
                              {test.test_code} | {test.category} | Sample: {test.sample_type}
                            </p>
                          </div>
                          <Badge>₹{test.cost}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      No tests found matching "{testSearchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Selected Tests</Label>
                <div className="text-sm text-gray-600">
                  Total: ₹{calculateTotalCost()}
                </div>
              </div>
              
              {fields.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tests selected</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Search and select tests from above
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TestTube className="w-4 h-4 text-medical-600" />
                          <p className="font-medium">
                            {watchTests[index].testName}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm text-gray-600">
                          Sample: {watchTests[index].sampleType}
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          Cost: ₹{watchTests[index].cost}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-2">
                        <Controller
                          name={`tests.${index}.isUrgent`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id={`tests.${index}.isUrgent`}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor={`tests.${index}.isUrgent`} className="text-sm">
                          Mark as Urgent
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.tests && (
                <p className="text-sm text-red-600 mt-1">{errors.tests.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Microscope className="w-5 h-5" />
              <span>Additional Information</span>
            </CardTitle>
            <CardDescription>
              Sample collection and payment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientPreparation">Patient Preparation</Label>
              <Textarea
                id="patientPreparation"
                {...register('patientPreparation')}
                placeholder="Enter any preparation instructions for the patient"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="isFasting"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isFasting"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isFasting">Fasting Required</Label>
            </div>

            <Separator />

            <div>
              <Label htmlFor="paymentStatus">Payment Status *</Label>
              <Controller
                name="paymentStatus"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentStatus && (
                <p className="text-sm text-red-600 mt-1">{errors.paymentStatus.message}</p>
              )}
            </div>

            {watchOrderType === 'stat' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">STAT Order</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  This is a STAT (emergency) order. Results will be prioritized and communicated immediately.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            Reset Form
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || fields.length === 0}
            className="bg-medical-600 hover:bg-medical-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Test Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}