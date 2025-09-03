'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  Clock,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  Smile,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
  UserPlus
} from "lucide-react"
import { DashboardSidebar } from "@/components/DashboardSidebar"

type AppointmentData = {
  id: string;
  time: string;
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  doctor: {
    id: string;
    name: string;
  };
  notes?: string;
  price?: number;
}

type DashboardStats = {
  todayAppointments: number;
  confirmedAppointments: number;
  totalPatients: number;
  pendingConfirmations: number;
  remindersToSend: number;
}

function DashboardPageContent() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null)
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    confirmedAppointments: 0,
    totalPatients: 0,
    pendingConfirmations: 0,
    remindersToSend: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [selectedDate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load appointments for selected date
      const dateStr = formatDateForAPI(selectedDate)
      const appointmentsResponse = await fetch(`/api/appointments?date=${dateStr}`)

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        // Ensure appointmentsData is an array
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
      } else {
        console.error('Failed to load appointments:', appointmentsResponse.status)
        setAppointments([])
      }

      // Load stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        console.error('Failed to load stats:', statsResponse.status)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate)
    previousDay.setDate(previousDay.getDate() - 1)
    setSelectedDate(previousDay)
  }

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    setSelectedDate(nextDay)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado'
      case 'SCHEDULED': return 'Agendado'
      case 'CANCELLED': return 'Cancelado'
      case 'COMPLETED': return 'Concluído'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Smile className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AgendaÁgil</span>
            </div>
            <div className="text-sm text-gray-500">
              Dr. João Silva - Clínica Odontológica Silva
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.confirmedAppointments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lembretes</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.remindersToSend}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Para enviar nas próximas 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingConfirmations}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Aguardando confirmação
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse rapidamente as funcionalidades mais utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button asChild className="h-auto p-4 flex-col space-y-2">
                    <Link href="/dashboard/patients/new">
                      <UserPlus className="h-6 w-6" />
                      <span className="text-sm font-medium">Novo Paciente</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Link href="/dashboard/calendar">
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm font-medium">Agendar Consulta</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Link href="/dashboard/whatsapp">
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Link href="/dashboard/patients">
                      <Users className="h-6 w-6" />
                      <span className="text-sm font-medium">Ver Pacientes</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Agenda do Dia</CardTitle>
                      <CardDescription>
                        {formatDate(selectedDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Hoje
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToNextDay}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Array.isArray(appointments) && appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold">{appointment.time}</div>
                            <div className="text-sm text-gray-500">{appointment.duration}min</div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{appointment.patient?.name || 'Paciente'}</h3>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                            <p className="text-sm text-gray-500">{appointment.patient?.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      ))}
                      
                      {Array.isArray(appointments) && appointments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Nenhuma consulta agendada para hoje
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full h-16 border-2 border-dashed"
                        onClick={() => setIsAddingPatient(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Consulta
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">

              {/* Recent Patients */}
              <Card>
                <CardHeader>
                  <CardTitle>Pacientes Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {appointment.patient?.name ?
                              appointment.patient.name.split(' ').map(n => n[0]).join('') :
                              '?'
                            }
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{appointment.patient?.name || 'Paciente'}</p>
                          <p className="text-xs text-gray-500">{appointment.patient?.phone}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      {/* Modal for appointment details */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes da Consulta</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedAppointment(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Paciente</Label>
                <div className="font-medium">{selectedAppointment.patient?.name || 'Paciente'}</div>
              </div>
              <div>
                <Label>Contato</Label>
                <div className="font-medium">{selectedAppointment.patient?.phone}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horário</Label>
                  <div className="font-medium">{selectedAppointment.time}</div>
                </div>
                <div>
                  <Label>Duração</Label>
                  <div className="font-medium">{selectedAppointment.duration}min</div>
                </div>
              </div>
              <div>
                <Label>Tipo</Label>
                <div className="font-medium">{selectedAppointment.type}</div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // Redirect to calendar with reschedule mode
                    const params = new URLSearchParams({
                      reschedule: selectedAppointment.id,
                      patientId: selectedAppointment.patient?.id || '',
                      patientName: selectedAppointment.patient?.name || '',
                      patientPhone: selectedAppointment.patient?.phone || ''
                    })
                    window.location.href = `/dashboard/calendar?${params.toString()}`
                  }}
                >
                  Remarcar
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button className="flex-1">
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal for adding patient */}
      {isAddingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nova Consulta</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsAddingPatient(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="patientName">Nome do Paciente</Label>
                <Input id="patientName" placeholder="Nome completo" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" />
                </div>
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input id="duration" type="number" defaultValue={30} />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Consulta</Label>
                <Input id="type" placeholder="Ex: Consulta, Limpeza, Extração" />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsAddingPatient(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setIsAddingPatient(false)}
                >
                  Agendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar currentPage="dashboard" />
      <div className="flex-1 overflow-hidden">
        <DashboardPageContent />
      </div>
    </div>
  )
}