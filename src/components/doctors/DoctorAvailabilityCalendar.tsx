import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle
} from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, parseISO } from 'date-fns'
import { useNavigate } from 'react-router-dom'

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

interface DoctorAvailabilityCalendarProps {
  doctor: Doctor
  onDateSelect?: (date: Date) => void
}

export default function DoctorAvailabilityCalendar({ doctor, onDateSelect }: DoctorAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "17:00", "17:30", "18:00", "18:30", "19:00"
  ])
  
  const navigate = useNavigate()

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Check if a date is a working day
  const isWorkingDay = (date: Date) => {
    const dayOfWeek = format(date, 'EEEE') // Monday, Tuesday, etc.
    return doctor.schedule?.workingDays?.includes(dayOfWeek) || false
  }

  // Check if a date is on leave
  const isOnLeave = (date: Date) => {
    if (!doctor.schedule?.leaves) return false
    
    return doctor.schedule.leaves.some((leave: any) => {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      const fromDate = new Date(leave.from)
      fromDate.setHours(0, 0, 0, 0)
      const toDate = new Date(leave.to)
      toDate.setHours(0, 0, 0, 0)
      
      return checkDate >= fromDate && checkDate <= toDate
    })
  }

  // Get leave reason for a date
  const getLeaveReason = (date: Date) => {
    if (!doctor.schedule?.leaves) return ''
    
    const leave = doctor.schedule.leaves.find((leave: any) => {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      const fromDate = new Date(leave.from)
      fromDate.setHours(0, 0, 0, 0)
      const toDate = new Date(leave.to)
      toDate.setHours(0, 0, 0, 0)
      
      return checkDate >= fromDate && checkDate <= toDate
    })
    
    return leave?.reason || 'On Leave'
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  // Get days in current month
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  // Get day class based on status
  const getDayClass = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) {
      return 'text-gray-300'
    }
    
    if (isToday(date)) {
      return 'bg-blue-100 text-blue-800 font-bold'
    }
    
    if (selectedDate && isSameDay(date, selectedDate)) {
      return 'bg-medical-100 text-medical-800 font-bold'
    }
    
    if (isOnLeave(date)) {
      return 'bg-red-100 text-red-800'
    }
    
    if (isWorkingDay(date)) {
      return 'bg-green-50 text-green-800'
    }
    
    return 'bg-gray-50 text-gray-400'
  }

  // Book appointment
  const bookAppointment = (slot: string) => {
    if (!selectedDate) return
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd')
    navigate(`/appointments/new?doctorId=${doctor.id}&date=${formattedDate}&time=${slot}`)
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="outline" size="sm" onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium text-sm py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {getDaysInMonth().map((date, i) => {
          const dayOfWeek = date.getDay()
          // Add empty cells for days before the first day of the month
          const emptyDaysAtStart = i === 0 ? Array(dayOfWeek).fill(null) : []
          
          return (
            <React.Fragment key={date.toISOString()}>
              {emptyDaysAtStart.map((_, index) => (
                <div key={`empty-start-${index}`} className="p-2 text-center text-gray-300"></div>
              ))}
              <div
                className={`p-2 text-center cursor-pointer rounded-md hover:bg-gray-100 ${getDayClass(date)}`}
                onClick={() => handleDateClick(date)}
              >
                <div className="text-sm">{format(date, 'd')}</div>
                {isOnLeave(date) && (
                  <div className="text-xs mt-1 truncate" title={getLeaveReason(date)}>
                    {getLeaveReason(date)}
                  </div>
                )}
              </div>
            </React.Fragment>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-50 rounded-full mr-1"></div>
          <span>Working Day</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 rounded-full mr-1"></div>
          <span>On Leave</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 rounded-full mr-1"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-medical-100 rounded-full mr-1"></div>
          <span>Selected</span>
        </div>
      </div>

      {/* Available Slots */}
      {selectedDate && (
        <div className="mt-4 border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Available Slots: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>
          
          {isOnLeave(selectedDate) ? (
            <div className="flex items-center space-x-2 text-red-600 py-2">
              <XCircle className="w-5 h-5" />
              <span>Doctor is on leave: {getLeaveReason(selectedDate)}</span>
            </div>
          ) : !isWorkingDay(selectedDate) ? (
            <div className="flex items-center space-x-2 text-gray-600 py-2">
              <XCircle className="w-5 h-5" />
              <span>Not a working day</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <Button 
                  key={slot} 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => bookAppointment(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}