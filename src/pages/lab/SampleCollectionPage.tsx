import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TestTube, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock,
  Printer,
  Loader2,
  User,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Microscope,
  Beaker,
  Trash2,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

// Types
interface SampleOrder {
  id: string
  orderNumber: string
  patientName: string
  patientId: string
  uhid: string
  orderDate: string
  orderTime: string
  status: 'pending' | 'collected' | 'received' | 'processing' | 'completed' | 'cancelled'
  priority: 'routine' | 'urgent' | 'stat'
  tests: {
    id: string
    name: string
    sampleType: string
    isUrgent: boolean
  }[]
  collectedBy?: string
  collectionTime?: string
  notes?: string
}

export default function SampleCollectionPage() {
  const [orders, setOrders] = useState<SampleOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedSampleType, setSelectedSampleType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('pending')
  const [refreshing, setRefreshing] = useState(false)
  
  const { hospitalId } = useAuth()
  const navigate = useNavigate()

  // Load sample orders
  useEffect(() => {
    if (hospitalId) {
      loadSampleOrders()
    }
  }, [hospitalId, activeTab])

  const loadSampleOrders = async () => {
    setLoading(true)
    try {
      // Mock data - in real implementation, would load from database
      const mockOrders: SampleOrder[] = [
        {
          id: '1',
          orderNumber: 'LAB001234',
          patientName: 'Rajesh Kumar',
          patientId: 'PAT001',
          uhid: 'UH001234',
          orderDate: '2024-01-18',
          orderTime: '09:30',
          status: 'pending',
          priority: 'routine',
          tests: [
            { id: '1', name: 'Complete Blood Count', sampleType: 'Blood', isUrgent: false },
            { id: '2', name: 'Liver Function Test', sampleType: 'Blood', isUrgent: false }
          ]
        },
        {
          id: '2',
          orderNumber: 'LAB001235',
          patientName: 'Priya Singh',
          patientId: 'PAT002',
          uhid: 'UH001235',
          orderDate: '2024-01-18',
          orderTime: '10:15',
          status: 'pending',
          priority: 'urgent',
          tests: [
            { id: '3', name: 'Blood Glucose', sampleType: 'Blood', isUrgent: true }
          ]
        },
        {
          id: '3',
          orderNumber: 'LAB001236',
          patientName: 'Amit Verma',
          patientId: 'PAT003',
          uhid: 'UH001236',
          orderDate: '2024-01-18',
          orderTime: '11:00',
          status: 'collected',
          priority: 'stat',
          tests: [
            { id: '4', name: 'Complete Blood Count', sampleType: 'Blood', isUrgent: true },
            { id: '5', name: 'Kidney Function Test', sampleType: 'Blood', isUrgent: true },
            { id: '6', name: 'Electrolytes', sampleType: 'Blood', isUrgent: true }
          ],
          collectedBy: 'Nurse Sharma',
          collectionTime: '11:15'
        },
        {
          id: '4',
          orderNumber: 'LAB001237',
          patientName: 'Sunita Devi',
          patientId: 'PAT004',
          uhid: 'UH001237',
          orderDate: '2024-01-18',
          orderTime: '09:00',
          status: 'received',
          priority: 'routine',
          tests: [
            { id: '7', name: 'Thyroid Function Test', sampleType: 'Blood', isUrgent: false },
            { id: '8', name: 'Lipid Profile', sampleType: 'Blood', isUrgent: false }
          ],
          collectedBy: 'Nurse Kumar',
          collectionTime: '09:30'
        },
        {
          id: '5',
          orderNumber: 'LAB001238',
          patientName: 'Rahul Sharma',
          patientId: 'PAT005',
          uhid: 'UH001238',
          orderDate: '2024-01-18',
          orderTime: '10:30',
          status: 'processing',
          priority: 'urgent',
          tests: [
            { id: '9', name: 'Urine Routine', sampleType: 'Urine', isUrgent: true }
          ],
          collectedBy: 'Nurse Patel',
          collectionTime: '10:45'
        }
      ]

      setOrders(mockOrders)
    } catch (error) {
      console.error('Error loading sample orders:', error)
      toast.error("Failed to load sample orders", {
        description: "Could not retrieve sample collection data"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadSampleOrders()
    setRefreshing(false)
  }

  // Filter orders
  const getFilteredOrders = () => {
    return orders.filter(order => {
      const statusMatch = activeTab === 'all' || order.status === activeTab
      const priorityMatch = selectedPriority === 'all' || order.priority === selectedPriority
      
      const sampleTypeMatch = selectedSampleType === 'all' || 
        order.tests.some(test => test.sampleType.toLowerCase() === selectedSampleType.toLowerCase())
      
      const searchMatch = !searchQuery || 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.uhid.toLowerCase().includes(searchQuery.toLowerCase())
      
      return statusMatch && priorityMatch && sampleTypeMatch && searchMatch
    })
  }

  // Get unique sample types
  const getSampleTypes = () => {
    const types = new Set<string>()
    orders.forEach(order => {
      order.tests.forEach(test => {
        types.add(test.sampleType)
      })
    })
    return Array.from(types)
  }

  // Mark sample as collected
  const collectSample = (orderId: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'collected' as const,
          collectedBy: 'Lab Technician',
          collectionTime: new Date().toTimeString().slice(0, 5)
        }
      }
      return order
    }))

    toast.success("Sample Collected", {
      description: "Sample has been marked as collected"
    })
  }

  // Mark sample as received
  const receiveSample = (orderId: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'received' as const
        }
      }
      return order
    }))

    toast.success("Sample Received", {
      description: "Sample has been marked as received in the lab"
    })
  }

  // Cancel order
  const cancelOrder = (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'cancelled' as const
        }
      }
      return order
    }))

    toast.success("Order Cancelled", {
      description: "Test order has been cancelled"
    })
  }

  // Print collection labels
  const printLabels = (order: SampleOrder) => {
    toast.success("Printing Labels", {
      description: `Printing ${order.tests.length} label(s) for ${order.patientName}`
    })
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'collected': return 'bg-blue-100 text-blue-800'
      case 'received': return 'bg-purple-100 text-purple-800'
      case 'processing': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
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

  const filteredOrders = getFilteredOrders()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sample Collection
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage laboratory sample collection and processing
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
          
          <Button onClick={() => navigate('/laboratory/test-order')}>
            <TestTube className="w-4 h-4 mr-2" />
            New Test Order
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Collection</TabsTrigger>
          <TabsTrigger value="collected">Collected</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>
        
        {/* Statistics Cards */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'collected').length}
              </div>
              <div className="text-sm text-gray-600">Collected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.status === 'received').length}
              </div>
              <div className="text-sm text-gray-600">Received</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.priority === 'stat').length}
              </div>
              <div className="text-sm text-gray-600">STAT</div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
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

            <div>
              <Label>Sample Type</Label>
              <Select value={selectedSampleType} onValueChange={setSelectedSampleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getSampleTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setSelectedPriority('all')
                setSelectedSampleType('all')
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-medical-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <TestTube className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No sample orders found</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/laboratory/test-order')}
              >
                Create Test Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-medical-100">
                      <TestTube className="w-5 h-5 text-medical-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{order.orderNumber}</h3>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Badge className={getPriorityBadgeColor(order.priority)}>
                          {order.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.orderDate} {order.orderTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 md:mt-0 flex space-x-2">
                    {order.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => collectSample(order.id)}
                        className="bg-medical-600 hover:bg-medical-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Collect
                      </Button>
                    )}
                    
                    {order.status === 'collected' && (
                      <Button 
                        size="sm" 
                        onClick={() => receiveSample(order.id)}
                      >
                        <Beaker className="w-4 h-4 mr-2" />
                        Receive
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => printLabels(order)}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Labels
                    </Button>
                    
                    {(order.status === 'pending' || order.status === 'collected') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => cancelOrder(order.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Patient</h4>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <p>{order.patientName}</p>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">UHID: {order.uhid}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Tests</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.tests.map((test, index) => (
                        <Badge key={index} variant="outline" className={test.isUrgent ? 'border-red-300' : ''}>
                          {test.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {order.status !== 'pending' && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Collection:</span> {order.collectedBy} at {order.collectionTime}
                    </p>
                  </div>
                )}

                {order.priority === 'stat' && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">STAT Order - Immediate Attention Required</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}