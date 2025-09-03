'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateTimeSlots, ScheduleSettings } from '@/lib/timeSlots'
import { Clock } from "lucide-react"

interface Appointment {
  id: string
  date: string
  duration: number
}

interface TimeSlotPickerProps {
  selectedDate: Date
  selectedTime?: string
  onTimeSelect: (time: string) => void
  scheduleSettings?: ScheduleSettings
  appointments?: Appointment[]
  duration?: number
}

const defaultScheduleSettings: ScheduleSettings = {
  workHours: {
    start: '08:00',
    end: '18:00'
  },
  lunchBreak: {
    start: '12:00',
    end: '13:00'
  },
  defaultDuration: 30,
  slotInterval: 15 // Default to 15-minute intervals for better granularity
}

export function TimeSlotPicker({
  selectedDate,
  selectedTime,
  onTimeSelect,
  scheduleSettings,
  appointments = [],
  duration = 30
}: TimeSlotPickerProps) {
  const settings = scheduleSettings || defaultScheduleSettings



  // Generate available time slots for the selected date
  const timeSlots = generateTimeSlots(settings)
  
  // Check if a time slot is occupied by an existing appointment
  const isSlotOccupied = (time: string) => {
    const slotDate = new Date(selectedDate)
    const [hours, minutes] = time.split(':').map(Number)
    slotDate.setHours(hours, minutes, 0, 0)

    const slotInterval = settings.slotInterval || 15
    const slotEnd = new Date(slotDate.getTime() + slotInterval * 60000)

    const isOccupied = appointments.some(appointment => {
      const appointmentDate = new Date(appointment.date)
      const appointmentEnd = new Date(appointmentDate.getTime() + appointment.duration * 60000)

      // A slot is occupied if ANY part of it overlaps with an appointment
      // This means: slot start < appointment end AND slot end > appointment start
      const overlaps = (slotDate < appointmentEnd && slotEnd > appointmentDate)



      return overlaps
    })

    return isOccupied
  }

  // Check if slot has enough consecutive free time
  const hasEnoughTime = (time: string) => {
    const slotDate = new Date(selectedDate)
    const [hours, minutes] = time.split(':').map(Number)
    slotDate.setHours(hours, minutes, 0, 0)

    const slotInterval = settings.slotInterval || 30
    const requiredSlots = Math.ceil(duration / slotInterval)

    // Check if we have enough consecutive free slots
    for (let i = 0; i < requiredSlots; i++) {
      const checkTime = new Date(slotDate.getTime() + i * slotInterval * 60000)
      const checkTimeStr = checkTime.toTimeString().slice(0, 5)

      // Check if this specific slot time exists in the available time slots
      const availableSlots = generateTimeSlots(settings)
      if (!availableSlots.includes(checkTimeStr)) {
        return false // Slot is outside working hours
      }

      // Check if this slot is occupied by checking against all appointments
      const slotEnd = new Date(checkTime.getTime() + slotInterval * 60000)
      const isOccupied = appointments.some(appointment => {
        const appointmentDate = new Date(appointment.date)
        const appointmentEnd = new Date(appointmentDate.getTime() + appointment.duration * 60000)

        // Check for overlap
        return (checkTime < appointmentEnd && slotEnd > appointmentDate)
      })

      if (isOccupied) {
        return false
      }
    }

    return true
  }

  const getSlotStatus = (time: string) => {
    // First check if this individual slot is occupied by any appointment
    if (isSlotOccupied(time)) return 'occupied'

    // Then check if we have enough consecutive time starting from this slot for the new procedure
    if (!hasEnoughTime(time)) return 'insufficient'

    return 'available'
  }

  const getSlotColor = (time: string) => {
    const status = getSlotStatus(time)
    if (selectedTime === time) return 'default'
    
    switch (status) {
      case 'occupied': return 'destructive'
      case 'insufficient': return 'secondary'
      case 'available': return 'outline'
      default: return 'outline'
    }
  }

  const isSlotDisabled = (time: string) => {
    const status = getSlotStatus(time)
    return status === 'occupied' || status === 'insufficient'
  }

  if (timeSlots.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Nenhum horário disponível para esta data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Horários Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={getSlotColor(time)}
              size="sm"
              className="text-xs h-8"
              disabled={isSlotDisabled(time)}
              onClick={() => onTimeSelect(time)}
            >
              {time}
            </Button>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Disponível</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>Ocupado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Tempo insuficiente</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
