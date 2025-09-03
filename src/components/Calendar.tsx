'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react"
import { generateTimeSlots, ScheduleSettings, getAppointmentTypeByValue } from '@/lib/timeSlots'

interface Appointment {
  id: string
  patientName: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  type: string
  phone: string
  date?: string
  clinic?: {
    id: string
    name: string
    address?: string
    phone?: string
  }
}

interface CalendarProps {
  appointments?: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
  onTimeSlotClick?: (time: string, date: Date) => void
  onDateChange?: (date: Date) => void
  scheduleSettings?: ScheduleSettings
  currentDate?: Date
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Default schedule settings
const defaultScheduleSettings: ScheduleSettings = {
  workHours: {
    start: '08:00',
    end: '18:00'
  },
  lunchBreak: {
    start: '12:00',
    end: '13:00'
  },
  defaultDuration: 30
}

export function Calendar({ appointments = [], onAppointmentClick, onTimeSlotClick, onDateChange, scheduleSettings, currentDate: externalCurrentDate }: CalendarProps) {
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  
  // Use external currentDate if provided, otherwise use internal state
  const currentDate = externalCurrentDate || internalCurrentDate
  
  // Use provided settings or fallback to defaults
  const settings = scheduleSettings || defaultScheduleSettings
  
  // Generate time slots based on schedule settings
  const timeSlots = generateTimeSlots(settings)

  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    
    startOfWeek.setDate(date.getDate() - day)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7)
    } else {
      newDate.setDate(currentDate.getDate() - 1)
    }
    // Only update internal state if no external currentDate is provided
    if (!externalCurrentDate) {
      setInternalCurrentDate(newDate)
    }
    onDateChange?.(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7)
    } else {
      newDate.setDate(currentDate.getDate() + 1)
    }
    // Only update internal state if no external currentDate is provided
    if (!externalCurrentDate) {
      setInternalCurrentDate(newDate)
    }
    onDateChange?.(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    // Only update internal state if no external currentDate is provided
    if (!externalCurrentDate) {
      setInternalCurrentDate(today)
    }
    onDateChange?.(today)
  }

  const getAppointmentForTimeSlot = (time: string, date: Date) => {
    return appointments.find(apt => {
      // Usar o campo time da API (que é extraído do campo date)
      if (!apt.time || !apt.date) return false

      const currentDate = new Date(date)
      const aptDate = new Date(apt.date)

      // Check if the appointment is on the same day
      const isSameDay = aptDate.toDateString() === currentDate.toDateString()

      if (isSameDay) {
        // Verificar se é exatamente o horário de início da consulta
        return apt.time === time
      }

      return false
    })
  }

  const isTimeSlotBlocked = (time: string, date: Date) => {
    // Versão simplificada: apenas verificar se há uma consulta que não seja no horário exato
    return appointments.some(appointment => {
      if (appointment.status === 'cancelled' || !appointment.time || !appointment.date) return false

      const aptDate = new Date(appointment.date)
      const currentDate = new Date(date)

      // Only check appointments on the same date
      if (aptDate.toDateString() !== currentDate.toDateString()) return false

      // Se é o horário exato da consulta, não bloquear (mostrar o card)
      if (appointment.time === time) return false

      // Verificar se este slot está dentro da duração da consulta
      const aptStartIndex = timeSlots.indexOf(appointment.time)
      const currentTimeIndex = timeSlots.indexOf(time)

      if (aptStartIndex !== -1 && currentTimeIndex !== -1) {
        const slotInterval = settings.slotInterval || 15
        const slotsNeeded = Math.ceil(appointment.duration / slotInterval)
        const remainingSlots = timeSlots.length - aptStartIndex
        const maxSlotsAllowed = Math.min(slotsNeeded, remainingSlots)

        // Bloquear se o slot atual está dentro da duração da consulta, mas apenas nos slots disponíveis
        return currentTimeIndex > aptStartIndex && currentTimeIndex < aptStartIndex + maxSlotsAllowed
      }

      return false
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Calcular altura máxima permitida para uma consulta (evitar overflow)
  const getMaxAllowedHeight = (startTime: string, duration: number) => {
    const startIndex = timeSlots.indexOf(startTime)
    if (startIndex === -1) return 56 // altura mínima se não encontrar o horário
    
    const slotInterval = settings.slotInterval || 15
    const slotsCount = Math.ceil(duration / slotInterval)
    const remainingSlots = timeSlots.length - startIndex
    const maxSlotsAllowed = Math.min(slotsCount, remainingSlots)
    
    return maxSlotsAllowed * 60 - 8 // altura baseada nos slots disponíveis (60px por slot no Calendar.tsx)
  }


  const weekDates = getWeekDates(currentDate)

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold capitalize">
            {formatMonthYear(currentDate)}
          </h2>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === 'day' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Dia
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 text-sm font-medium text-gray-500 border-r">
              Horário
            </div>
            {(viewMode === 'week' ? weekDates : [currentDate]).map((date, index) => (
              <div 
                key={index} 
                className={`p-4 text-center border-r last:border-r-0 ${
                  date.toDateString() === new Date().toDateString() 
                    ? 'bg-blue-50' 
                    : ''
                }`}
              >
                <div className="text-sm font-medium">
                  {viewMode === 'week' ? weekDays[date.getDay()] : 'Hoje'}
                </div>
                <div className={`text-lg ${
                  date.toDateString() === new Date().toDateString() 
                    ? 'text-blue-600 font-semibold' 
                    : ''
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 border-b last:border-b-0 hover:bg-gray-50">
                <div className="p-3 text-sm font-medium text-gray-600 border-r flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  {time}
                </div>
                
                {(viewMode === 'week' ? weekDates : [currentDate]).map((date, index) => {
                  const appointment = getAppointmentForTimeSlot(time, date)
                  const isBlocked = isTimeSlotBlocked(time, date)
                  // Verificar se é o primeiro slot da consulta
                  const isFirstSlot = appointment && appointment.time === time



                  return (
                    <div
                      key={index}
                      className={`p-2 border-r last:border-r-0 min-h-[60px] relative ${
                        isBlocked ? 'cursor-not-allowed bg-gray-100' :
                        appointment && appointment.status === 'cancelled' ? 'cursor-pointer hover:bg-red-50 opacity-60' :
                        'cursor-pointer hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (appointment && onAppointmentClick && isFirstSlot && appointment.status !== 'cancelled') {
                          onAppointmentClick(appointment)
                        } else if ((!appointment || appointment.status === 'cancelled') && !isBlocked && onTimeSlotClick) {
                          onTimeSlotClick(time, date)
                        }
                      }}
                    >
                      {appointment && isFirstSlot ? (
                        <div className={`p-2 rounded-md border text-xs relative ${getStatusColor(appointment.status)} ${appointment.status === 'cancelled' ? 'relative' : ''}`}>
                          <div className="font-medium truncate flex items-center relative z-10">
                            <User className="h-3 w-3 mr-1" />
                            {appointment.patientName}
                          </div>
                          <div className="truncate mt-1 relative z-10">
                            {appointment.teeth && appointment.teeth.length > 0 ? (
                              <div>
                                <div className="text-green-700 font-semibold text-xs">🦷 {appointment.teeth.length} dentes</div>
                                <div className="text-xs truncate">{appointment.teeth.map(t => t.procedure).join(', ')}</div>
                              </div>
                            ) : (
                              appointment.type
                            )}
                          </div>
                          <div className="text-xs opacity-75 mt-1 relative z-10">
                            {appointment.duration}min
                          </div>
                          {appointment.clinic && (
                            <div className="text-xs opacity-75 mt-1 truncate relative z-10">
                              📍 {appointment.clinic.name}
                            </div>
                          )}
                          {appointment.status === 'cancelled' && (
                            <div className="absolute inset-0 bg-red-50 bg-opacity-50 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : isBlocked ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-xs text-gray-500 text-center">
                            <div className="w-full h-1 bg-gray-300 rounded mb-1"></div>
                            <span>Ocupado</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
          <span>Agendado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-200 rounded-full"></div>
          <span>Confirmado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
          <span>Concluído</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-200 rounded-full"></div>
          <span>Cancelado</span>
        </div>
      </div>
    </div>
  )
}