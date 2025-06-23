import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  Loader2,
  CalendarDays,
  CalendarOff
} from 'lucide-react'
import { format, addDays } from 'date-fns'

// Types
interface Doctor {
  id: string
  employee_id: string
  user_id: string
  department_id: string
  personal_info: any
  professional_info: any
  schedule: any
  consultation_fee: number
  is_available: boolean
  is_active: boolean
  users: {
    full_name: string
    email: string
    phone: string
    avatar_url: string | null
  }
  departments: {
    name: string
    code: string
  }
}

interface DoctorScheduleFormProps {
  doctor: Doctor
  onSubmit: (data: any) => void
  onCancel: () => void
}

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Time slots for selection
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0')
      const formattedMinute = minute.toString().padStart(2, '0')
      slots.push(`${formattedHour}:${formattedMinute}`)
    }
  }
  return slots
}

const timeSlots = generateTimeSlots()

// Leave types
const leaveTypes = ['Vacation', 'Sick Leave', 'Conference', 'Personal', 'Other']

export default function DoctorScheduleForm({ 
  doctor, 
  onSubmit, 
  onCancel 
}: DoctorScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Initialize form with existing schedule or defaults
  const defaultSchedule = doctor.schedule || {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    shifts: {
      Monday: { morning: { start: '09:00', end: '13:00' }, evening: { start: '17:00', end: '20:00' } },
      Tuesday: { morning: { start: '09:00', end: '13:00' }, evening: { start: '17:00', end: '20:00' } },
      Wednesday: { morning: { start: '09:00', end: '13:00' }, evening: { start: '17:00', end: '20:00' } },
      Thursday: { morning: { start: '09:00', end: '13:00' }, evening: { start: '17:00', end: '20:00' } },
      Friday: { morning: { start: '09:00', end: '13:00' }, evening: { start: '17:00', end: '20:00' } },
      Saturday: { morning: { start: '', end: '' }, evening: { start: '', end: '' } },
      Sunday: { morning: { start: '', end: '' }, evening: { start: '', end: '' } }
    },
    breaks: [],
    leaves: []
  }

  // State for working days
  const [workingDays, setWorkingDays] = useState<string[]>(defaultSchedule.workingDays || [])
  
  // State for shifts
  const [shifts, setShifts] = useState<any>(defaultSchedule.shifts || {})
  
  // State for breaks
  const [breaks, setBreaks] = useState<any[]>(defaultSchedule.breaks || [])
  
  // State for leaves
  const [leaves, setLeaves] = useState<any[]>(defaultSchedule.leaves || [])

  // Handle working day toggle
  const toggleWorkingDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day))
    } else {
      setWorkingDays([...workingDays, day])
    }
  }

  // Handle shift change
  const handleShiftChange = (day: string, shift: 'morning' | 'evening', field: 'start' | 'end', value: string) => {
    setShifts({
      ...shifts,
      [day]: {
        ...shifts[day],
        [shift]: {
          ...shifts[day]?.[shift],
          [field]: value
        }
      }
    })
  }

  // Add break
  const addBreak = () => {
    setBreaks([
      ...breaks,
      {
        name: 'Lunch Break',
        start: '13:00',
        end: '14:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    ])
  }

  // Update break
  const updateBreak = (index: number, field: string, value: any) => {
    const updatedBreaks = [...breaks]
    updatedBreaks[index] = {
      ...updatedBreaks[index],
      [field]: value
    }
    setBreaks(updatedBreaks)
  }

  // Remove break
  const removeBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index))
  }

  // Add leave
  const addLeave = () => {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    
    setLeaves([
      ...leaves,
      {
        type: 'Vacation',
        reason: 'Vacation',
        from: format(today, 'yyyy-MM-dd'),
        to: format(tomorrow, 'yyyy-MM-dd')
      }
    ])
  }

  // Update leave
  const updateLeave = (index: number, field: string, value: any) => {
    const updatedLeaves = [...leaves]
    updatedLeaves[index] = {
      ...updatedLeaves[index],
      [field]: value
    }
    setLeaves(updatedLeaves)
  }

  // Remove leave
  const removeLeave = (index: number) => {
    setLeaves(leaves.filter((_, i) => i !== index))
  }

  // Submit form
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Prepare schedule data
      const scheduleData = {
        workingDays,
        shifts,
        breaks,
        leaves
      }
      
      // Call the onSubmit callback with the schedule data
      await onSubmit(scheduleData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="working-days">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="working-days">Working Days</TabsTrigger>
          <TabsTrigger value="breaks">Breaks</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
        </TabsList>

        {/* Working Days Tab */}
        <TabsContent value="working-days" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Working Days</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <div 
                    key={day} 
                    className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
                      workingDays.includes(day) 
                        ? 'bg-medical-100 text-medical-800 border border-medical-200' 
                        : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                    }`}
                    onClick={() => toggleWorkingDay(day)}
                  >
                    <p className="text-sm font-medium">{day.substring(0, 3)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Configure Working Hours</Label>
              <div className="space-y-4 mt-2">
                {workingDays.map((day) => (
                  <div key={day} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">{day}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Morning Shift */}
                      <div className="space-y-2">
                        <Label>Morning Shift</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-500">Start</Label>
                            <Select 
                              value={shifts[day]?.morning?.start || ''} 
                              onValueChange={(value) => handleShiftChange(day, 'morning', 'start', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Start time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={`morning-start-${time}`} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">End</Label>
                            <Select 
                              value={shifts[day]?.morning?.end || ''} 
                              onValueChange={(value) => handleShiftChange(day, 'morning', 'end', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="End time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={`morning-end-${time}`} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Evening Shift */}
                      <div className="space-y-2">
                        <Label>Evening Shift</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-500">Start</Label>
                            <Select 
                              value={shifts[day]?.evening?.start || ''} 
                              onValueChange={(value) => handleShiftChange(day, 'evening', 'start', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Start time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={`evening-start-${time}`} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">End</Label>
                            <Select 
                              value={shifts[day]?.evening?.end || ''} 
                              onValueChange={(value) => handleShiftChange(day, 'evening', 'end', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="End time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={`evening-end-${time}`} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Breaks Tab */}
        <TabsContent value="breaks" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Configure Breaks</Label>
            <Button type="button" onClick={addBreak} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Break
            </Button>
          </div>

          {breaks.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No breaks configured</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={addBreak}
              >
                Add Break
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {breaks.map((breakItem, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Break #{index + 1}</h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeBreak(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Break Name</Label>
                      <Input
                        value={breakItem.name}
                        onChange={(e) => updateBreak(index, 'name', e.target.value)}
                        placeholder="e.g., Lunch Break"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Start Time</Label>
                        <Select 
                          value={breakItem.start} 
                          onValueChange={(value) => updateBreak(index, 'start', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={`break-start-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Select 
                          value={breakItem.end} 
                          onValueChange={(value) => updateBreak(index, 'end', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={`break-end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Apply to Days</Label>
                    <div className="grid grid-cols-7 gap-2 mt-2">
                      {daysOfWeek.map((day) => (
                        <div 
                          key={day} 
                          className={`p-2 rounded-lg text-center cursor-pointer transition-colors text-xs ${
                            breakItem.days?.includes(day) 
                              ? 'bg-medical-100 text-medical-800 border border-medical-200' 
                              : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                          }`}
                          onClick={() => {
                            const currentDays = breakItem.days || []
                            const newDays = currentDays.includes(day)
                              ? currentDays.filter((d: string) => d !== day)
                              : [...currentDays, day]
                            updateBreak(index, 'days', newDays)
                          }}
                        >
                          {day.substring(0, 3)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Leaves Tab */}
        <TabsContent value="leaves" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Configure Leaves</Label>
            <Button type="button" onClick={addLeave} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Leave
            </Button>
          </div>

          {leaves.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <CalendarOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leaves configured</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={addLeave}
              >
                Add Leave
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Leave #{index + 1}</h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeLeave(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Leave Type</Label>
                      <Select 
                        value={leave.type} 
                        onValueChange={(value) => updateLeave(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Reason</Label>
                      <Input
                        value={leave.reason}
                        onChange={(e) => updateLeave(index, 'reason', e.target.value)}
                        placeholder="Enter reason for leave"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={leave.from}
                        onChange={(e) => updateLeave(index, 'from', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={leave.to}
                        onChange={(e) => updateLeave(index, 'to', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button
          type="button"
          onClick={handleSubmit}
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
              Save Schedule
            </>
          )}
        </Button>
      </div>
    </div>
  )
}