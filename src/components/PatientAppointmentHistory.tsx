'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { getAppointmentTypeByValue } from '@/lib/timeSlots'

interface AppointmentHistoryItem {
  id: string
  date: string
  time: string
  duration: number
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  type: string
  notes?: string
  price?: number
  doctor: {
    id: string
    name: string
  }
  createdAt: string
}

interface AppointmentStats {
  total: number
  completed: number
  cancelled: number
  upcoming: number
  lastAppointment?: {
    date: string
    type: string
    status: string
  } | null
  nextAppointment?: {
    date: string
    type: string
    status: string
  } | null
}

interface PatientAppointmentHistoryProps {
  patientId: string
  patientName: string
  doctorId: string
  onNewAppointment?: () => void
}

export function PatientAppointmentHistory({ 
  patientId, 
  patientName,
  doctorId,
  onNewAppointment 
}: PatientAppointmentHistoryProps) {
  const [appointments, setAppointments] = useState<AppointmentHistoryItem[]>([])
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0
  })
  const [loading, setLoading] = useState(true)
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null)

  useEffect(() => {
    loadAppointmentHistory()
  }, [patientId, doctorId])

  const loadAppointmentHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patients/${patientId}/appointments?doctorId=${doctorId}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
        setStats(data.stats)
      } else {
        console.error('Failed to load appointment history:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Error loading appointment history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      case 'CONFIRMED':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmada
          </Badge>
        )
      case 'SCHEDULED':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Agendada
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        )
      case 'NO_SHOW':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Faltou
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  const getAppointmentTypeInfo = (type: string) => {
    return getAppointmentTypeByValue(type)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Concluídas</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.upcoming}</div>
              <div className="text-sm text-gray-600">Próximas</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Canceladas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Information */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Última Consulta:</strong> {
                stats.lastAppointment 
                  ? `${formatDate(stats.lastAppointment.date)} - ${stats.lastAppointment.type}`
                  : 'Nunca'
              }
            </div>
            <div>
              <strong>Próxima Consulta:</strong> {
                stats.nextAppointment 
                  ? `${formatDate(stats.nextAppointment.date)} - ${stats.nextAppointment.type}`
                  : 'Não agendada'
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Appointment Button */}
      {onNewAppointment && (
        <Button onClick={onNewAppointment} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Nova Consulta para {patientName}
        </Button>
      )}

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Histórico de Consultas ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma consulta encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const typeInfo = getAppointmentTypeInfo(appointment.type)
                const isExpanded = expandedAppointment === appointment.id
                
                return (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-4 ${
                      isUpcoming(appointment.date) 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-3 h-3 rounded-full bg-${typeInfo.color}-400`}></div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{typeInfo.label}</span>
                            {getStatusBadge(appointment.status)}
                            {isUpcoming(appointment.date) && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                Próxima
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{appointment.time} ({appointment.duration}min)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{appointment.doctor.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedAppointment(
                          isExpanded ? null : appointment.id
                        )}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {appointment.price && (
                            <div>
                              <strong>Valor:</strong> R$ {appointment.price.toFixed(2)}
                            </div>
                          )}
                          <div>
                            <strong>Criado em:</strong> {formatDateTime(appointment.createdAt)}
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-1 mb-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <strong className="text-sm">Observações:</strong>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md text-sm">
                              {appointment.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}