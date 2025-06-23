import React, { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { createTenantQuery } from '@/services/supabaseClient'

// Types
interface Advice {
  id: string
  advice_category: string
  advice_text: string
  applicable_conditions: string[]
  department_specific: boolean
  department_id: string | null
  priority_order: number
  is_active: boolean
  created_at: string
  departments?: {
    name: string
  }
}

interface Department {
  id: string
  name: string
  code: string
}

// Validation schema
const adviceSchema = z.object({
  advice_category: z.string().min(2, 'Category must be at least 2 characters'),
  advice_text: z.string().min(5, 'Advice text must be at least 5 characters'),
  applicable_conditions: z.array(z.string()).default([]),
  department_specific: z.boolean().default(false),
  department_id: z.string().nullable().optional(),
  priority_order: z.number().int().min(0, 'Priority must be a positive number')
})

type AdviceForm = z.infer<typeof adviceSchema>

const adviceCategories = [
  'General', 'Diet', 'Exercise', 'Medication', 'Lifestyle', 
  'Follow-up', 'Precautions', 'Post-operative', 'Pre-operative', 'Other'
]

const commonConditions = [
  'Hypertension', 'Diabetes', 'Asthma', 'Pregnancy', 'Heart Disease',
  'Kidney Disease', 'Liver Disease', 'Thyroid Disorder', 'Obesity',
  'Fever', 'Cough', 'Cold', 'Headache', 'Backache', 'Joint Pain'
]

export default function AdviceMasterPage() {
  const [adviceList, setAdviceList] = useState<Advice[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDepartmentSpecific, setSelectedDepartmentSpecific] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdvice, setEditingAdvice] = useState<Advice | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [newCondition, setNewCondition] = useState('')

  const { hospitalId, user } = useAuth()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AdviceForm>({
    resolver: zodResolver(adviceSchema),
    defaultValues: {
      applicable_conditions: [],
      department_specific: false,
      priority_order: 0
    }
  })

  const watchDepartmentSpecific = watch('department_specific')
  const watchApplicableConditions = watch('applicable_conditions')

  // Load advice and departments
  useEffect(() => {
    if (hospitalId) {
      loadAdvice()
      loadDepartments()
    }
  }, [hospitalId])

  const loadAdvice = async () => {
    setLoading(true)
    try {
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.select('advice_master')
        .select(`
          *,
          departments (
            name
          )
        `)
        .order('priority_order', { ascending: false })
        .order('advice_category', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      setAdviceList(data || [])
    } catch (error: any) {
      console.error('Error loading advice:', error)
      toast.error("Failed to load advice data", {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const query = createTenantQuery(hospitalId)
      const { data, error } = await query.select('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      setDepartments(data || [])
    } catch (error: any) {
      console.error('Error loading departments:', error)
      toast.error("Failed to load departments", {
        description: error.message
      })
    }
  }

  // Filter advice
  const getFilteredAdvice = () => {
    return adviceList.filter(advice => {
      const searchMatch = !searchQuery || 
        advice.advice_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advice.advice_category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const categoryMatch = selectedCategory === 'all' || advice.advice_category === selectedCategory
      const departmentSpecificMatch = selectedDepartmentSpecific === 'all' || 
        (selectedDepartmentSpecific === 'yes' && advice.department_specific) ||
        (selectedDepartmentSpecific === 'no' && !advice.department_specific)
      
      return searchMatch && categoryMatch && departmentSpecificMatch
    })
  }

  // Pagination
  const getPaginatedAdvice = () => {
    const filtered = getFilteredAdvice()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return {
      data: filtered.slice(startIndex, endIndex),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    }
  }

  // Submit form
  const onSubmit = async (data: AdviceForm) => {
    if (!hospitalId || !user) return

    try {
      const query = createTenantQuery(hospitalId)
      
      // If department_specific is false, set department_id to null
      if (!data.department_specific) {
        data.department_id = null
      }
      
      const adviceData = {
        ...data,
        created_by: user.id,
        is_active: true
      }

      if (editingAdvice) {
        // Update existing advice
        const { error } = await query.update('advice_master', adviceData)
          .eq('id', editingAdvice.id)

        if (error) throw new Error(error.message)

        toast.success("Advice Updated", {
          description: "Advice has been updated successfully"
        })
      } else {
        // Create new advice
        const { error } = await query.insert('advice_master', adviceData)

        if (error) throw new Error(error.message)

        toast.success("Advice Added", {
          description: "Advice has been added successfully"
        })
      }

      setIsDialogOpen(false)
      setEditingAdvice(null)
      reset()
      await loadAdvice()

    } catch (error: any) {
      console.error('Error saving advice:', error)
      toast.error("Failed to save advice", {
        description: error.message
      })
    }
  }

  // Edit advice
  const handleEdit = (advice: Advice) => {
    setEditingAdvice(advice)
    setValue('advice_category', advice.advice_category)
    setValue('advice_text', advice.advice_text)
    setValue('applicable_conditions', advice.applicable_conditions || [])
    setValue('department_specific', advice.department_specific)
    setValue('department_id', advice.department_id)
    setValue('priority_order', advice.priority_order)
    setIsDialogOpen(true)
  }

  // Delete advice
  const handleDelete = async (advice: Advice) => {
    if (!confirm(`Are you sure you want to delete this advice?`)) return

    try {
      const query = createTenantQuery(hospitalId)
      const { error } = await query.update('advice_master', { is_active: false })
        .eq('id', advice.id)

      if (error) throw new Error(error.message)

      toast.success("Advice Deleted", {
        description: "Advice has been deleted successfully"
      })

      await loadAdvice()
    } catch (error: any) {
      console.error('Error deleting advice:', error)
      toast.error("Failed to delete advice", {
        description: error.message
      })
    }
  }

  // Reset form and close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAdvice(null)
    reset()
  }

  // Add condition to applicable conditions
  const addCondition = () => {
    if (!newCondition.trim()) return
    
    const currentConditions = watchApplicableConditions || []
    if (!currentConditions.includes(newCondition)) {
      setValue('applicable_conditions', [...currentConditions, newCondition])
    }
    setNewCondition('')
  }

  // Remove condition from applicable conditions
  const removeCondition = (condition: string) => {
    const currentConditions = watchApplicableConditions || []
    setValue('applicable_conditions', currentConditions.filter(c => c !== condition))
  }

  // Add common condition to applicable conditions
  const addCommonCondition = (condition: string) => {
    const currentConditions = watchApplicableConditions || []
    if (!currentConditions.includes(condition)) {
      setValue('applicable_conditions', [...currentConditions, condition])
    }
  }

  const { data: paginatedData, total, totalPages } = getPaginatedAdvice()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advice Master
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage medical advice templates and recommendations
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingAdvice(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Advice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAdvice ? 'Edit Advice' : 'Add New Advice'}
                </DialogTitle>
                <DialogDescription>
                  {editingAdvice ? 'Update advice information' : 'Add a new advice to the database'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="advice_category">Category *</Label>
                    <Controller
                      name="advice_category"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {adviceCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.advice_category && (
                      <p className="text-sm text-red-600 mt-1">{errors.advice_category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="priority_order">Priority Order *</Label>
                    <Input
                      id="priority_order"
                      type="number"
                      min="0"
                      step="1"
                      {...register('priority_order', { valueAsNumber: true })}
                      placeholder="Enter priority order"
                    />
                    {errors.priority_order && (
                      <p className="text-sm text-red-600 mt-1">{errors.priority_order.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="advice_text">Advice Text *</Label>
                  <Textarea
                    id="advice_text"
                    {...register('advice_text')}
                    placeholder="Enter advice text"
                    rows={4}
                  />
                  {errors.advice_text && (
                    <p className="text-sm text-red-600 mt-1">{errors.advice_text.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="department_specific"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="department_specific"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="department_specific">Department Specific</Label>
                  </div>

                  {watchDepartmentSpecific && (
                    <div className="mt-2">
                      <Label htmlFor="department_id">Department *</Label>
                      <Controller
                        name="department_id"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || ''}>
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
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Applicable Conditions</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {watchApplicableConditions?.map((condition) => (
                      <Badge key={condition} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeCondition(condition)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add condition"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addCondition}>
                      Add
                    </Button>
                  </div>

                  <div className="mt-2">
                    <Label>Common Conditions</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {commonConditions.map((condition) => (
                        <Badge 
                          key={condition} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => addCommonCondition(condition)}
                        >
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingAdvice ? 'Update Advice' : 'Add Advice'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                  placeholder="Search advice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {adviceCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Department Specific</Label>
              <Select value={selectedDepartmentSpecific} onValueChange={setSelectedDepartmentSpecific}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedDepartmentSpecific('all')
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advice Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ListChecks className="w-5 h-5" />
            <span>Advice Templates ({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Advice Text</TableHead>
                    <TableHead>Applicable Conditions</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((advice) => (
                    <TableRow key={advice.id}>
                      <TableCell>
                        <Badge variant="outline">{advice.advice_category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate">{advice.advice_text}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {advice.applicable_conditions.length > 0 ? (
                            advice.applicable_conditions.slice(0, 2).map((condition, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800">
                                {condition}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                          {advice.applicable_conditions.length > 2 && (
                            <Badge className="bg-gray-100 text-gray-800">
                              +{advice.applicable_conditions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {advice.department_specific ? (
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span>{advice.departments?.name || 'Unknown'}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">All</span>
                        )}
                      </TableCell>
                      <TableCell>{advice.priority_order}</TableCell>
                      <TableCell>
                        <Badge variant={advice.is_active ? 'default' : 'secondary'}>
                          {advice.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(advice)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(advice)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} entries
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}