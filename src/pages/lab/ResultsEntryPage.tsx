import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TestTube, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock,
  Save,
  Loader2,
  User,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Microscope,
  FileText,
  Printer,
  Download,
  Eye,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

// Types
interface TestResult {
  id: string
  orderNumber: string
  testName: string
  patientName: string
  patientId: string
  uhid: string
  sampleId: string
  sampleType: string
  collectionTime: string
  receivedTime: string
  status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'rejected'
  priority: 'routine' | 'urgent' | 'stat'
  normalRange?: string
  unit?: string
  result?: string
  interpretation?: string
  remarks?: string
  performedBy?: string
  verifiedBy?: string
  completedAt?: string
}

// Validation schema
const resultEntrySchema = z.object({
  result: z.string().min(1, 'Result is required'),
  interpretation: z.enum(['normal', 'abnormal', 'critical'], {
    required_error: 'Please select interpretation'
  }),
  remarks: z.string().optional(),
  performedBy: z.string().min(1, 'Performed by is required')
})

type ResultEntryForm = z.infer<typeof resultEntrySchema>

export default function ResultsEntryPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [refreshing, setRefreshing] = useState(false)
  
  const { hospitalId, user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ResultEntryForm>({
    resolver: zodResolver(resultEntrySchema),
    defaultValues: {
      interpretation: 'normal',
      performedBy: user?.full_name || ''
    }
  })

  // Load test results
  useEffect(() => {
    if (hospitalId) {
      loadTestResults()
    }
  }, [hospitalId, activeTab])

  const loadTestResults = async () => {
    setLoading(true)
    try {
      // Mock data - in real implementation, would load from database
      const mockResults: TestResult[] = [
        {
          id: '1',
          orderNumber: 'LAB001234',
          testName: 'Complete Blood Count',
          patientName: 'Rajesh Kumar',
          patientId: 'PAT001',
          uhid: 'UH001234',
          sampleId: 'S001234',
          sampleType: 'Blood',
          collectionTime: '2024-01-18 09:30',
          receivedTime: '2024-01-18 10:00',
          status: 'pending',
          priority: 'routine',
          normalRange: 'WBC: 4.5-11.0 x10^9/L, RBC: 4.5-5.9 x10^12/L, Hb: 13.5-17.5 g/dL',
          unit: 'Various'
        },
        {
          id: '2',
          orderNumber: 'LAB001235',
          testName: 'Blood Glucose',
          patientName: 'Priya Singh',
          patientId: 'PAT002',
          uhid: 'UH001235',
          sampleId: 'S001235',
          sampleType: 'Blood',
          collectionTime: '2024-01-18 10:15',
          receivedTime: '2024-01-18 10:30',
          status: 'in_progress',
          priority: 'urgent',
          normalRange: '70-100 mg/dL (Fasting)',
          unit: 'mg/dL'
        },
        {
          id: '3',
          orderNumber: 'LAB001236',
          testName: 'Liver Function Test',
          patientName: 'Amit Verma',
          patientId: 'PAT003',
          uhid: 'UH001236',
          sampleId: 'S001236',
          sampleType: 'Blood',
          collectionTime: '2024-01-18 09:00',
          receivedTime: '2024-01-18 09:15',
          status: 'completed',
          priority: 'stat',
          normalRange: 'ALT: 7-55 U/L, AST: 8-48 U/L, ALP: 45-115 U/L',
          unit: 'U/L',
          result: 'ALT: 30 U/L, AST: 28 U/L, ALP: 90 U/L',
          interpretation: 'normal',
          remarks: 'Within normal limits',
          performedBy: 'Lab Tech Sharma',
          completedAt: '2024-01-18 11:30'
        },
        {
          id: '4',
          orderNumber: 'LAB001237',
          testName: 'Thyroid Function Test',
          patientName: 'Sunita Devi',
          patientId: 'PAT004',
          uhid: 'UH001237',
          sampleId: 'S001237',
          sampleType: 'Blood',
          collectionTime: '2024-01-18 08:30',
          receivedTime: '2024-01-18 09:00',
          status: 'verified',
          priority: 'routine',
          normalRange: 'TSH: 0.4-4.0 mIU/L, T4: 4.5-12.0 µg/dL, T3: 80-200 ng/dL',
          unit: 'Various',
          result: 'TSH: 2.5 mIU/L, T4: 8.3 µg/dL, T3: 120 ng/dL',
          interpretation: 'normal',
          remarks: 'Normal thyroid function',
          performedBy: 'Lab Tech Patel',
          verifiedBy: 'Dr. Gupta',
          completedAt: '2024-01-18 12:00'
        },
        {
          id: '5',
          orderNumber: 'LAB001238',
          testName: 'Urine Routine',
          patientName: 'Rahul Sharma',
          patientId: 'PAT005',
          uhid: 'UH001238',
          sampleId: 'S001238',
          sampleType: 'Urine',
          collectionTime: '2024-01-18 10:30',
          receivedTime: '2024-01-18 10:45',
          status: 'rejected',
          priority: 'routine',
          remarks: 'Sample hemolyzed, please recollect'
        }
      ]

      setTestResults(mockResults)
    } catch (error) {
      console.error('Error loading test results:', error)
      toast.error("Failed to load test results", {
        description: "Could not retrieve test result data"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadTestResults()
    setRefreshing(false)
  }

  // Filter test results
  const getFilteredResults = () => {
    return testResults.filter(result => {
      const statusMatch = activeTab === 'all' || result.status === activeTab
      const priorityMatch = selectedPriority === 'all' || result.priority === selectedPriority
      
      const searchMatch = !searchQuery || 
        result.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.testName.toLowerCase().includes(searchQuery.toLowerCase())
      
      return statusMatch && priorityMatch && searchMatch
    })
  }

  // Submit result
  const onSubmit = async (data: ResultEntryForm) => {
    if (!selectedTest) return

    try {
      // Update the selected test with the form data
      const updatedResults = testResults.map(result => {
        if (result.id === selectedTest.id) {
          return {
            ...result,
            result: data.result,
            interpretation: data.interpretation,
            remarks: data.remarks,
            performedBy: data.performedBy,
            status: 'completed' as const,
            completedAt: new Date().toLocaleString()
          }
        }
        return result
      })

      setTestResults(updatedResults)
      setSelectedTest(null)
      reset()

      toast.success("Result Saved", {
        description: "Test result has been saved successfully"
      })
    } catch (error: any) {
      console.error('Error saving result:', error)
      toast.error("Failed to save result", {
        description: error.message || "An unexpected error occurred"
      })
    }
  }

  // Verify result
  const verifyResult = (resultId: string) => {
    const updatedResults = testResults.map(result => {
      if (result.id === resultId) {
        return {
          ...result,
          status: 'verified' as const,
          verifiedBy: user?.full_name || 'Lab Supervisor'
        }
      }
      return result
    })

    setTestResults(updatedResults)

    toast.success("Result Verified", {
      description: "Test result has been verified successfully"
    })
  }

  // Reject sample
  const rejectSample = (resultId: string, reason: string = 'Sample rejected') => {
    if (!confirm('Are you sure you want to reject this sample?')) return

    const updatedResults = testResults.map(result => {
      if (result.id === resultId) {
        return {
          ...result,
          status: 'rejected' as const,
          remarks: reason
        }
      }
      return result
    })

    setTestResults(updatedResults)

    toast.success("Sample Rejected", {
      description: "Sample has been marked as rejected"
    })
  }

  // Start processing
  const startProcessing = (resultId: string) => {
    const updatedResults = testResults.map(result => {
      if (result.id === resultId) {
        return {
          ...result,
          status: 'in_progress' as const
        }
      }
      return result
    })

    setTestResults(updatedResults)

    toast.success("Processing Started", {
      description: "Sample processing has been started"
    })
  }

  // Print result
  const printResult = (result: TestResult) => {
    toast.success("Printing Result", {
      description: `Printing result for ${result.testName}`
    })
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'verified': return 'bg-purple-100 text-purple-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-orange-100 text-orange-800'
      case 'routine': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get interpretation badge color
  const getInterpretationBadgeColor = (interpretation?: string) => {
    switch (interpretation) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'abnormal': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredResults = getFilteredResults()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Results Entry
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter and verify laboratory test results
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={() => navigate('/laboratory')}>
            <Microscope className="w-4 h-4 mr-2" />
            Lab Dashboard
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Results</TabsTrigger>
        </TabsList>
        
        {/* Statistics Cards */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {testResults.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {testResults.filter(r => r.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {testResults.filter(r => r.status === 'verified').length}
              </div>
              <div className="text-sm text-gray-600">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by order #, patient, test..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setSelectedPriority('all')
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-medical-600" />
            </div>
          ) : filteredResults.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <TestTube className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No test results found</p>
              </CardContent>
            </Card>
          ) : (
            filteredResults.map((result) => (
              <Card 
                key={result.id} 
                className={`hover:shadow-md transition-shadow ${
                  selectedTest?.id === result.id ? 'ring-2 ring-medical-500' : ''
                }`}
                onClick={() => {
                  if (result.status === 'pending' || result.status === 'in_progress') {
                    setSelectedTest(result)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-medical-100">
                        <TestTube className="w-5 h-5 text-medical-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{result.testName}</h3>
                          <Badge className={getStatusBadgeColor(result.status)}>
                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                          </Badge>
                          <Badge className={getPriorityBadgeColor(result.priority)}>
                            {result.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Order: {result.orderNumber} | Sample: {result.sampleId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 md:mt-0 flex space-x-2">
                      {result.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            startProcessing(result.id)
                          }}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                      
                      {result.status === 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            verifyResult(result.id)
                          }}
                          className="bg-medical-600 hover:bg-medical-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      )}
                      
                      {(result.status === 'completed' || result.status === 'verified') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            printResult(result)
                          }}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </Button>
                      )}
                      
                      {(result.status === 'pending' || result.status === 'in_progress') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            rejectSample(result.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Patient</h4>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <p>{result.patientName}</p>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">UHID: {result.uhid}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Sample</h4>
                      <div className="flex items-center space-x-2">
                        <TestTube className="w-4 h-4 text-gray-400" />
                        <p>{result.sampleType} | {result.sampleId}</p>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        Collected: {result.collectionTime.split(' ')[1]}
                      </p>
                    </div>
                  </div>

                  {(result.status === 'completed' || result.status === 'verified') && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">Result:</span> {result.result}
                          </p>
                          {result.interpretation && (
                            <Badge className={getInterpretationBadgeColor(result.interpretation)}>
                              {result.interpretation}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          By: {result.performedBy}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.status === 'rejected' && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <p className="text-sm font-medium">Rejected: {result.remarks}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Result Entry Form */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Microscope className="w-5 h-5" />
                <span>Result Entry</span>
              </CardTitle>
              <CardDescription>
                Enter test results and interpretation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTest ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="p-3 bg-medical-50 border border-medical-200 rounded-lg">
                    <p className="font-medium">{selectedTest.testName}</p>
                    <p className="text-sm text-gray-600">
                      Patient: {selectedTest.patientName} | Sample: {selectedTest.sampleId}
                    </p>
                    {selectedTest.normalRange && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Normal Range:</span> {selectedTest.normalRange}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="result">Result *</Label>
                    <Textarea
                      id="result"
                      {...register('result')}
                      placeholder="Enter test result"
                      rows={3}
                    />
                    {errors.result && (
                      <p className="text-sm text-red-600 mt-1">{errors.result.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="interpretation">Interpretation *</Label>
                    <Controller
                      name="interpretation"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interpretation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.interpretation && (
                      <p className="text-sm text-red-600 mt-1">{errors.interpretation.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      {...register('remarks')}
                      placeholder="Enter any remarks or notes"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="performedBy">Performed By *</Label>
                    <Input
                      id="performedBy"
                      {...register('performedBy')}
                      placeholder="Enter name of person performing test"
                    />
                    {errors.performedBy && (
                      <p className="text-sm text-red-600 mt-1">{errors.performedBy.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedTest(null)}
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
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Result
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Microscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a test to enter results</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click on a pending or in-progress test from the list
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}