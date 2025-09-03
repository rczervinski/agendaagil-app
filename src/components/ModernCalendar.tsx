'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin } from "lucide-react"
import { generateTimeSlots, ScheduleSettings } from '@/lib/timeSlots'

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

interface ModernCalendarProps {
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

export function ModernCalendar({ 
  appointments = [], 
  onAppointmentClick, 
  onTimeSlotClick, 
  onDateChange, 
  scheduleSettings, 
  currentDate: externalCurrentDate 
}: ModernCalendarProps) {
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
    if (!externalCurrentDate) {
      setInternalCurrentDate(newDate)
    }
    onDateChange?.(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    if (!externalCurrentDate) {
      setInternalCurrentDate(today)
    }
    onDateChange?.(today)
  }

  // Calcular posição do slot no grid (baseado no índice do timeSlots)
  const getSlotPosition = (time: string) => {
    return timeSlots.indexOf(time) + 2 // +2 porque a primeira linha é o header
  }

  // Calcular quantos slots uma consulta ocupa
  const getSlotsCount = (duration: number) => {
    const slotInterval = 15 // slots de 15 minutos
    return Math.ceil(duration / slotInterval)
  }

  // Calcular altura máxima permitida para uma consulta (evitar overflow)
  const getMaxAllowedHeight = (startTime: string, duration: number) => {
    const startIndex = timeSlots.indexOf(startTime)
    if (startIndex === -1) return 76 // altura mínima se não encontrar o horário
    
    const slotsCount = getSlotsCount(duration)
    const remainingSlots = timeSlots.length - startIndex
    const maxSlotsAllowed = Math.min(slotsCount, remainingSlots)
    
    return maxSlotsAllowed * 80 - 4 // altura baseada nos slots disponíveis
  }

  // Obter consultas para uma data específica
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      if (!apt.date) return false
      const aptDate = new Date(apt.date)
      return aptDate.toDateString() === date.toDateString()
    })
  }

  // Verificar se um slot está ocupado por alguma consulta
  const isSlotOccupied = (time: string, date: Date) => {
    const dayAppointments = getAppointmentsForDate(date)

    return dayAppointments.some(appointment => {
      if (appointment.status === 'cancelled') return false

      const aptStartIndex = timeSlots.indexOf(appointment.time)
      const currentTimeIndex = timeSlots.indexOf(time)
      const slotsNeeded = getSlotsCount(appointment.duration)

      return currentTimeIndex >= aptStartIndex && currentTimeIndex < aptStartIndex + slotsNeeded
    })
  }



  // Obter cores baseadas no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }


  const weekDates = getWeekDates(currentDate)
  const datesToShow = viewMode === 'week' ? weekDates : [currentDate]

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

      {/* Modern Calendar Grid */}
      <Card className="overflow-hidden">
        <CardContent className="p-0" style={{ marginTop: '-25px' }}>
          {/* Header com dias da semana - colado no topo */}
          <div className={`grid ${viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-2'} bg-gray-50 border-b`}>
            <div className="p-3 text-sm font-medium text-gray-600 border-r">
              Horário
            </div>
            {datesToShow.map((date, index) => (
              <div
                key={index}
                className={`p-3 text-center border-r last:border-r-0 ${
                  date.toDateString() === new Date().toDateString()
                    ? 'bg-blue-50 text-blue-600'
                    : ''
                }`}
              >
                <div className="text-sm font-medium">
                  {viewMode === 'week' ? weekDays[date.getDay()] : 'Hoje'}
                </div>
                <div className={`text-lg font-semibold ${
                  date.toDateString() === new Date().toDateString()
                    ? 'text-blue-600'
                    : ''
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horários - altura aumentada */}
          <div className="relative max-h-[600px] overflow-y-auto">
            {/* Grid base de slots */}
            <div className={`grid ${viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-2'}`}>
              {timeSlots.map((time, timeIndex) => (
                <div key={time} className="contents">
                  {/* Coluna de horário */}
                  <div className="p-3 text-sm font-medium text-gray-600 border-r border-b flex items-center h-20">
                    <Clock className="h-3 w-3 mr-2" />
                    {time}
                  </div>

                  {/* Colunas dos dias */}
                  {datesToShow.map((date, dayIndex) => {
                    const isOccupied = isSlotOccupied(time, date)

                    // Buscar consultas que COMEÇAM neste horário específico
                    const appointmentsForThisSlot = getAppointmentsForDate(date).filter(apt => apt.time === time)

                    return (
                      <div
                        key={`${timeIndex}-${dayIndex}`}
                        className={`relative border-r border-b last:border-r-0 h-20 ${
                          isOccupied ? 'bg-gray-100 cursor-not-allowed' :
                          'cursor-pointer hover:bg-blue-50 transition-colors'
                        }`}
                        onClick={() => {
                          if (!isOccupied && onTimeSlotClick) {
                            onTimeSlotClick(time, date)
                          }
                        }}
                      >
                        {/* Renderizar cards de consulta DENTRO da célula */}
                        {appointmentsForThisSlot.map(appointment => {
                          const slotsCount = getSlotsCount(appointment.duration)
                          const maxHeight = getMaxAllowedHeight(appointment.time, appointment.duration)

                          return (
                            <div
                              key={appointment.id}
                              className={`absolute rounded-lg p-2 transition-all hover:shadow-lg pointer-events-auto cursor-pointer ${getStatusColor(appointment.status)}`}
                              style={{
                                top: '2px',
                                left: '2px',
                                right: '2px',
                                height: slotsCount > 1 ? `${maxHeight}px` : 'calc(100% - 4px)',
                                zIndex: 10,
                                minHeight: '76px' // Ajustado para nova altura da célula (80px - 4px)
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                onAppointmentClick?.(appointment)
                              }}
                            >
                              <div className="h-full flex flex-col justify-center">
                                {/* Para consultas de 15min, aproveitar melhor o espaço */}
                                {appointment.duration <= 15 ? (
                                  <>
                                    <div className="font-bold text-sm truncate flex items-center mb-1">
                                      <User className="h-4 w-4 mr-1 flex-shrink-0" />
                                      {appointment.patientName}
                                    </div>
                                    <div className="truncate font-medium text-sm mb-1">
                                      {appointment.teeth && appointment.teeth.length > 0 ? (
                                        <div>
                                          <div className="text-green-700 font-semibold">🦷 {appointment.teeth.length} dentes</div>
                                          <div className="text-xs truncate">{appointment.teeth.map(t => t.procedure).join(', ')}</div>
                                        </div>
                                      ) : (
                                        appointment.type
                                      )}
                                    </div>
                                    <div className="text-xs opacity-75 flex items-center justify-between">
                                      <span>⏱️ {appointment.duration}min</span>
                                      <span>🕐 {appointment.time}</span>
                                    </div>
                                    {appointment.clinic && (
                                      <div className="text-xs opacity-75 mt-1 truncate flex items-center">
                                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                        {appointment.clinic.name}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div className="font-bold text-sm truncate flex items-center mb-1">
                                      <User className="h-4 w-4 mr-1 flex-shrink-0" />
                                      {appointment.patientName}
                                    </div>
                                    <div className="truncate font-medium text-sm mb-1">
                                      {appointment.teeth && appointment.teeth.length > 0 ? (
                                        <div>
                                          <div className="text-green-700 font-semibold">🦷 {appointment.teeth.length} dentes</div>
                                          <div className="text-xs truncate">{appointment.teeth.map(t => t.procedure).join(', ')}</div>
                                        </div>
                                      ) : (
                                        appointment.type
                                      )}
                                    </div>
                                    <div className="text-sm opacity-75 font-medium mb-1">
                                      ⏱️ {appointment.duration}min
                                    </div>
                                    <div className="text-sm opacity-75">
                                      🕐 {appointment.time}
                                    </div>
                                    {appointment.clinic && (
                                      <div className="text-xs opacity-75 mt-1 truncate flex items-center">
                                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                        {appointment.clinic.name}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}


                        {/* Botão de adicionar apenas se não há consultas */}
                        {!isOccupied && appointmentsForThisSlot.length === 0 && (
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
