'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModernCalendar } from "@/components/ModernCalendar"
import { DatePicker } from "@/components/DatePicker"
import { TimeSlotPicker } from "@/components/TimeSlotPicker"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { 
  Smile,
  Bell,
  Settings,
  LogOut,
  Calendar as CalendarIcon,
  Users, 
  MessageCircle,
  Plus,
  Phone,
  Mail,
  Clock,
  X,
  Edit3,
  RotateCcw
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScheduleSettings, APPOINTMENT_TYPES, canScheduleAppointment } from "@/lib/timeSlots"
import { PatientPicker } from "@/components/PatientPicker"
import { TeethSelector } from "@/components/dental/TeethSelector"
import { DentalChart } from "@/components/dental/DentalChart"
import { ToothProcedureModal } from "@/components/dental/ToothProcedureModal"
import { NumberingSystem } from "@/components/dental/utils/toothTypes"
import { universalToFDI } from "@/components/dental/utils/toothMapping"
import { useToothNumbering } from "@/hooks/useToothNumbering"

interface AppointmentData {
  id: string
  patientName: string
  phone: string
  time: string
  duration: number
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  type: string
  date: string
  patient: {
    id: string
    name: string
    phone: string
    cpf?: string
    birthDate?: string
    gender?: string
    contactSource?: string
    email?: string
    address?: string
    allergies?: string
    medications?: string
    emergencyContact?: string
    medicalHistory?: string
    patientNotes?: string
  }
  doctor: {
    id: string
    name: string
  }
  clinic?: {
    id: string
    name: string
    address?: string
    phone?: string
  }
  teeth?: Array<{
    toothNumber: number
    toothNumberFDI: string
    procedure: string
    notes?: string
  }>
  notes?: string
  price?: number
}

type DashboardStats = {
  todayAppointments: number;
  confirmedAppointments: number;
  totalPatients: number;
  pendingConfirmations: number;
  remindersToSend: number;
}

function CalendarPageContent() {
  const { userData } = useAuth()
  const { numberingSystem } = useToothNumbering()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null)
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    confirmedAppointments: 0,
    totalPatients: 0,
    pendingConfirmations: 0,
    remindersToSend: 0
  })
  const [loading, setLoading] = useState(true)
  const [prefilledPatient, setPrefilledPatient] = useState<{
    id?: string
    name?: string
    phone?: string
  } | null>(null)
  const [foundPatient, setFoundPatient] = useState<any>(null)
  const [isSearchingPatient, setIsSearchingPatient] = useState(false)
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    available: boolean
    conflicts?: any[]
    suggestions?: any[]
    message?: string
  } | null>(null)
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null)
  const [showPatientPicker, setShowPatientPicker] = useState(false)
  const [showRescheduleCalendar, setShowRescheduleCalendar] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState(new Date())
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [procedures, setProcedures] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([])
  const [teethProcedures, setTeethProcedures] = useState<any[]>([])
  const [showTeethModal, setShowTeethModal] = useState(false)
  const [showToothProcedureModal, setShowToothProcedureModal] = useState(false)
  const [appointmentMode, setAppointmentMode] = useState<'simple' | 'dental'>('simple')
  const [formValues, setFormValues] = useState({
    patientPhone: '',
    patientName: '',
    type: 'Consulta',
    duration: '30',
    notes: '',
    clinicId: ''
  })

  useEffect(() => {
    loadAppointments()
    loadStats()
    loadScheduleSettings()
    if (userData?.tenantId) {
      loadProcedures()
      loadClinics()
    }
  }, [selectedDate, userData?.tenantId])

  // Update form values when procedures are loaded
  useEffect(() => {
    if (procedures.length > 0 && formValues.type === 'Consulta') {
      setFormValues(prev => ({
        ...prev,
        type: procedures[0].name,
        duration: procedures[0].duration.toString()
      }))
    }
  }, [procedures])

  // Separate effect to handle URL parameters after appointments are loaded
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const patientId = urlParams.get('patientId')
    const patientName = urlParams.get('patientName')
    const patientPhone = urlParams.get('patientPhone')
    const rescheduleId = urlParams.get('reschedule')

    if (rescheduleId && appointments.length > 0) {
      // Find the appointment to reschedule
      const appointmentToReschedule = appointments.find(apt => apt.id === rescheduleId)
      if (appointmentToReschedule) {
        setReschedulingAppointmentId(rescheduleId)
        setIsRescheduling(true)
        setIsAddingAppointment(true)
        setFoundPatient(appointmentToReschedule.patient)
        
        // Set form values
        setFormValues({
          patientPhone: appointmentToReschedule.patient?.phone || '',
          patientName: appointmentToReschedule.patient?.name || '',
          type: appointmentToReschedule.type || 'consultation',
          duration: appointmentToReschedule.duration?.toString() || '30',
          notes: appointmentToReschedule.notes || '',
          clinicId: appointmentToReschedule.clinic?.id || ''
        })
      }
    } else if (patientId && patientName) {
      setPrefilledPatient({
        id: patientId,
        name: patientName,
        phone: patientPhone || ''
      })
      setFormValues({
        ...formValues,
        patientPhone: patientPhone || '',
        patientName: patientName || ''
      })
      setIsAddingAppointment(true)
    }
  }, [appointments])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadScheduleSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.schedule) {
          setScheduleSettings({
            workHours: data.schedule.workHours,
            lunchBreak: data.schedule.lunchBreak,
            defaultDuration: data.schedule.defaultDuration,
            slotInterval: data.schedule.slotInterval || 15,
            enableLunchBreak: data.schedule.enableLunchBreak !== false
          })
        }
      }
    } catch (error) {
      console.error('Error loading schedule settings:', error)
    }
  }

  const loadProcedures = async () => {
    if (!userData?.tenantId) return

    try {
      const response = await fetch(`/api/procedures?tenantId=${userData.tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setProcedures(data)

        // If no procedures exist, fallback to default appointment types
        if (data.length === 0) {
          setProcedures(APPOINTMENT_TYPES.map(type => ({
            id: type.value,
            name: type.label,
            duration: type.duration,
            isActive: true
          })))
        }
      } else {
        // Fallback to default appointment types on error
        setProcedures(APPOINTMENT_TYPES.map(type => ({
          id: type.value,
          name: type.label,
          duration: type.duration,
          isActive: true
        })))
      }
    } catch (error) {
      console.error('Error loading procedures:', error)
      // Fallback to default appointment types on error
      setProcedures(APPOINTMENT_TYPES.map(type => ({
        id: type.value,
        name: type.label,
        duration: type.duration,
        isActive: true
      })))
    }
  }

  const loadClinics = async () => {
    if (!userData?.id) return

    try {
      const response = await fetch(`/api/clinics?doctorId=${userData.id}`)
      if (response.ok) {
        const data = await response.json()
        setClinics(data)
      } else {
        console.error('Failed to load clinics')
        setClinics([])
      }
    } catch (error) {
      console.error('Error loading clinics:', error)
      setClinics([])
    }
  }

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const searchPatientByPhone = async (phone: string) => {
    if (!phone || phone.length < 10) return

    setIsSearchingPatient(true)
    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const doctorId = userData?.doctorId || 'default-doctor-id'
      const response = await fetch(`/api/patients/search?phone=${cleanPhone}&doctorId=${doctorId}`)

      if (response.ok) {
        const patient = await response.json()
        setFoundPatient(patient)

        // Auto-fill form with found patient data using state
        setFormValues(prev => ({
          ...prev,
          patientName: patient.name || '',
          patientPhone: patient.phone || ''
        }))

      } else if (response.status === 404) {
        setFoundPatient(null)
      }
    } catch (error) {
      console.error('Error searching patient:', error)
    } finally {
      setIsSearchingPatient(false)
    }
  }

  const checkAvailability = async (date: Date, duration: number) => {
    try {
      // Validate date before making the request
      if (!date || isNaN(date.getTime())) {
        console.error('Invalid date provided to checkAvailability')
        return null
      }

      const response = await fetch('/api/appointments/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date.toISOString(),
          duration,
          userId: userData?.doctorId || 'default-doctor-id', // Updated to use auth
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setAvailabilityCheck(result)
        return result
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    }
    return null
  }

  const loadAppointments = async () => {
    try {
      setLoading(true)
      
      // Get the week dates to load appointments for the entire visible week
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
      
      const weekDates = getWeekDates(selectedDate)
      const startDate = formatDateForAPI(weekDates[0])
      const endDate = formatDateForAPI(weekDates[6])
      
      // Load appointments for the entire week range
      const response = await fetch(`/api/appointments?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentClick = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment)
  }

  const handleTimeSlotClick = (time: string, date: Date) => {
    setSelectedTimeSlot(time)
    setSelectedDate(date)
    setIsAddingAppointment(true)
  }

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CONFIRMED'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erro ao confirmar consulta: ${error.error}`)
        return
      }

      // Reload appointments and close modal
      loadAppointments()
      setSelectedAppointment(null)
      alert('Consulta confirmada com sucesso!')
    } catch (error) {
      console.error('Error confirming appointment:', error)
      alert('Erro ao confirmar consulta. Tente novamente.')
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erro ao cancelar consulta: ${error.error}`)
        return
      }

      // Reload appointments and close modal
      loadAppointments()
      setSelectedAppointment(null)
      alert('Consulta cancelada com sucesso!')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Erro ao cancelar consulta. Tente novamente.')
    }
  }

  const handleCompleteAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja marcar esta consulta como concluída?')) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erro ao concluir consulta: ${error.error}`)
        return
      }

      // Reload appointments and close modal
      loadAppointments()
      setSelectedAppointment(null)
      alert('Consulta marcada como concluída!')
    } catch (error) {
      console.error('Error completing appointment:', error)
      alert('Erro ao concluir consulta. Tente novamente.')
    }
  }

  const createDoctorPatientRelationship = async (globalPatientId: string, patientName: string, patientPhone: string) => {
    try {
      // Create a doctor-patient relationship for an existing global patient
      const response = await fetch('/api/doctor-patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: patientName,
          patientPhone: patientPhone,
          doctorId: userData?.doctorId || 'default-doctor-id',
          tenantId: userData?.tenantId || 'default-tenant-id',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error creating doctor-patient relationship:', error)
        return null
      }

      const newRelationship = await response.json()
      return { doctorPatientId: newRelationship.id, id: newRelationship.patient.id }
    } catch (error) {
      console.error('Error creating doctor-patient relationship:', error)
      return null
    }
  }

  const handlePatientSelect = (patient: any) => {
    setFoundPatient(patient)
    
    // Update form values
    setFormValues({
      ...formValues,
      patientPhone: patient.phone || '',
      patientName: patient.name || ''
    })
  }

  const handleTeethProceduresChange = (procedures: any[]) => {
    setTeethProcedures(procedures)
    setShowToothProcedureModal(false)
    
    // Calcular duração total quando estamos no modo dental
    if (appointmentMode === 'dental' && procedures.length > 0) {
      const totalDuration = procedures.reduce((total, proc) => total + (proc.duration || 30), 0)
      setFormValues(prev => ({
        ...prev,
        duration: totalDuration.toString(),
        type: 'Procedimentos Dentais'
      }))
    }
  }

  // Função helper para exibir numeração de dente baseada na configuração
  const getToothDisplayNumber = (toothNumber: number) => {
    return numberingSystem === NumberingSystem.FDI 
      ? universalToFDI(toothNumber) 
      : toothNumber.toString()
  }

  const handleRescheduleAppointment = () => {
    if (!selectedAppointment) return

    // Store the appointment ID for rescheduling
    setReschedulingAppointmentId(selectedAppointment.id)

    // Initialize reschedule date and time
    const appointmentDate = new Date(selectedAppointment.date)
    setRescheduleDate(appointmentDate)
    setRescheduleTime(appointmentDate.toTimeString().slice(0, 5))

    // Close the appointment details modal
    setSelectedAppointment(null)

    // Set the form to reschedule mode with current appointment data
    setIsRescheduling(true)
    setIsAddingAppointment(true)

    // Pre-fill form data from the current appointment
    setFoundPatient(selectedAppointment.patient)

    // Set form values
    setFormValues({
      patientPhone: selectedAppointment.patient?.phone || '',
      patientName: selectedAppointment.patient?.name || '',
      type: selectedAppointment.type || 'consultation',
      duration: selectedAppointment.duration?.toString() || '30',
      notes: selectedAppointment.notes || '',
      clinicId: ''
    })
  }

  const handleCreateOrRescheduleAppointment = async () => {
    try {
      const form = document.getElementById('appointment-form') as HTMLFormElement
      if (!form) return

      // Usar valores do estado em vez de FormData para maior confiabilidade
      const patientName = formValues.patientName
      const patientPhone = formValues.patientPhone
      const type = formValues.type
      const notes = formValues.notes
      const duration = parseInt(formValues.duration)

      // Pegar campos opcionais do FormData
      const formData = new FormData(form)
      const patientAge = formData.get('patientAge') as string



      if (!patientName || !patientPhone) {
        alert('Nome e telefone são obrigatórios')
        return
      }

      // Use appropriate date and time based on mode
      let timeToUse: string
      let dateToUse: Date

      if (isRescheduling) {
        // Use reschedule date and time for rescheduling
        if (!rescheduleTime || !rescheduleDate) {
          alert('Selecione uma data e horário para reagendar')
          return
        }
        timeToUse = rescheduleTime
        dateToUse = rescheduleDate
      } else {
        // Use selected date and time for new appointments
        if (!selectedTimeSlot || !selectedDate) {
          alert('Selecione uma data e horário no calendário')
          return
        }
        timeToUse = selectedTimeSlot
        dateToUse = selectedDate
      }

      if (!dateToUse || isNaN(dateToUse.getTime())) {
        alert('Data inválida')
        return
      }

      // Parse time and create full date
      const timeSlotParts = timeToUse.split(':')
      if (timeSlotParts.length !== 2) {
        alert('Horário inválido')
        return
      }

      const [hours, minutes] = timeSlotParts.map(Number)
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        alert('Horário inválido')
        return
      }

      const appointmentDate = new Date(dateToUse)
      appointmentDate.setHours(hours, minutes, 0, 0)

      // Validate the final date
      if (isNaN(appointmentDate.getTime())) {
        alert('Data/horário inválidos')
        return
      }

      // Validate appointment respects working hours
      const scheduleSettings: ScheduleSettings = {
        workHours: { start: '08:00', end: '22:30' },
        lunchBreak: { start: '12:00', end: '13:00' },
        defaultDuration: 30
      }
      
      if (!canScheduleAppointment(timeToUse, duration, scheduleSettings)) {
        alert('Esta consulta ultrapassaria o horário de funcionamento (22:30). Selecione um horário anterior ou reduza a duração.')
        return
      }

      // Check availability first
      const availabilityResult = await checkAvailability(appointmentDate, duration)
      if (availabilityResult && !availabilityResult.available) {
        alert(`Horário não disponível: ${availabilityResult.message}`)
        return
      }

      if (isRescheduling && reschedulingAppointmentId) {
        // REAGENDAMENTO: Usar API tradicional (já tem relacionamento)
        const appointmentResponse = await fetch(`/api/appointments/${reschedulingAppointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: appointmentDate.toISOString(),
            duration,
            type: type,
            notes: notes || undefined,
            status: 'SCHEDULED', // Reset status when rescheduling
            clinicId: formValues.clinicId || undefined,
          }),
        })

        if (!appointmentResponse.ok) {
          const error = await appointmentResponse.json()
          alert(`Erro ao reagendar consulta: ${error.error}`)
          return
        }

        alert('Consulta reagendada com sucesso!')

      } else {
        // NOVA CONSULTA: Usar API tradicional
        const appointmentResponse = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientName,
            patientPhone,
            userId: userData?.doctorId || 'default-doctor-id',
            tenantId: userData?.tenantId || 'default-tenant-id',
            date: appointmentDate.toISOString(),
            duration,
            type: appointmentMode === 'dental' && teethProcedures.length > 0 
              ? 'Procedimentos Dentais' 
              : type,
            notes: notes || undefined,
            clinicId: formValues.clinicId || undefined,
            teethProcedures: appointmentMode === 'dental' && teethProcedures.length > 0 
              ? teethProcedures 
              : undefined,
          }),
        })

        if (!appointmentResponse.ok) {
          const error = await appointmentResponse.json()
          alert(`Erro ao criar consulta: ${error.error}`)
          return
        }

        // Os dados dos dentes agora são salvos automaticamente na API de appointments

        alert('Consulta criada com sucesso!')
      }

      // Success! Close modal and reload
      setIsAddingAppointment(false)
      setIsRescheduling(false)
      setReschedulingAppointmentId(null)
      setSelectedTimeSlot('')
      setRescheduleDate(new Date())
      setRescheduleTime('')
      setPrefilledPatient(null)
      setFoundPatient(null)
      setAvailabilityCheck(null)
      setSelectedTeeth([])
      setTeethProcedures([])
      setShowTeethModal(false)
      setShowToothProcedureModal(false)
      setAppointmentMode('simple')
      loadAppointments()

      // Clear URL parameters
      const url = new URL(window.location.href)
      url.searchParams.delete('patientId')
      url.searchParams.delete('patientName')
      url.searchParams.delete('patientPhone')
      window.history.replaceState({}, '', url.toString())

    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Erro ao criar consulta. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <div className="flex items-center space-x-2">
              <Smile className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">AgendaÁgil</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 hidden md:block truncate">
              Dr. João Silva - Clínica Odontológica Silva
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2" asChild>
              <Link href="/auth/login">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-6">
          <div className="flex flex-col space-y-4 mb-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Calendário de Consultas</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Gerencie seus agendamentos de forma visual e intuitiva</p>
            </div>
            <Button 
              onClick={() => setIsAddingAppointment(true)}
              className="shrink-0 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>

          {/* Calendar Component */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ModernCalendar
              appointments={appointments.map(apt => ({
                id: apt.id,
                patientName: apt.patient.name,
                phone: apt.patient.phone,
                time: apt.time,
                duration: apt.duration,
                status: apt.status.toLowerCase() as 'scheduled' | 'confirmed' | 'cancelled' | 'completed',
                type: apt.type,
                date: apt.date,
                clinic: apt.clinic ? {
                  id: apt.clinic.id,
                  name: apt.clinic.name,
                  address: apt.clinic.address,
                  phone: apt.clinic.phone
                } : undefined
              }))}
              onAppointmentClick={(appointment) => {
                const fullAppointment = appointments.find(apt => apt.id === appointment.id)
                if (fullAppointment) {
                  handleAppointmentClick(fullAppointment)
                }
              }}
              onTimeSlotClick={handleTimeSlotClick}
              onDateChange={(newDate) => {
                setSelectedDate(newDate)
              }}
              scheduleSettings={scheduleSettings || undefined}
              currentDate={selectedDate}
            />
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Consultas Hoje</p>
                    <p className="text-lg sm:text-xl font-bold">{stats.todayAppointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Confirmados</p>
                    <p className="text-lg sm:text-xl font-bold">{stats.confirmedAppointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Pendentes</p>
                    <p className="text-lg sm:text-xl font-bold">{stats.pendingConfirmations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Lembretes</p>
                    <p className="text-lg sm:text-xl font-bold">{stats.remindersToSend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Modal for appointment details */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
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
            <CardContent className="space-y-6">
              {/* Patient Header */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-blue-600">
                    {selectedAppointment.patient?.name ?
                      selectedAppointment.patient.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) :
                      '?'
                    }
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedAppointment.patient?.name || 'Paciente'}</h3>
                  <p className="text-gray-600">{selectedAppointment.type}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedAppointment.patient?.phone}</span>
                    </div>
                    {selectedAppointment.patient?.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedAppointment.patient.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={
                  selectedAppointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  selectedAppointment.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                  selectedAppointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  selectedAppointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {selectedAppointment.status === 'CONFIRMED' ? 'Confirmado' :
                   selectedAppointment.status === 'SCHEDULED' ? 'Agendado' :
                   selectedAppointment.status === 'CANCELLED' ? 'Cancelado' :
                   selectedAppointment.status === 'COMPLETED' ? 'Concluído' :
                   selectedAppointment.status}
                </Badge>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Consulta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Data</Label>
                        <div className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Horário</Label>
                        <div className="font-medium">{selectedAppointment.time}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Duração</Label>
                      <div className="font-medium">{selectedAppointment.duration} minutos</div>
                    </div>
                    {selectedAppointment.notes && (
                      <div>
                        <Label className="text-sm text-gray-600">Observações</Label>
                        <div className="text-sm bg-gray-50 p-2 rounded">{selectedAppointment.notes}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Dados do Paciente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedAppointment.patient?.birthDate && (
                      <div>
                        <Label className="text-sm text-gray-600">Data de Nascimento</Label>
                        <div className="font-medium">{new Date(selectedAppointment.patient.birthDate).toLocaleDateString('pt-BR')}</div>
                      </div>
                    )}
                    {selectedAppointment.patient?.cpf && (
                      <div>
                        <Label className="text-sm text-gray-600">CPF</Label>
                        <div className="font-medium">{selectedAppointment.patient.cpf}</div>
                      </div>
                    )}
                    {selectedAppointment.patient?.gender && (
                      <div>
                        <Label className="text-sm text-gray-600">Gênero</Label>
                        <div className="font-medium">
                          {selectedAppointment.patient.gender === 'MALE' ? 'Masculino' :
                           selectedAppointment.patient.gender === 'FEMALE' ? 'Feminino' : 'Outro'}
                        </div>
                      </div>
                    )}
                    {selectedAppointment.patient?.address && (
                      <div>
                        <Label className="text-sm text-gray-600">Endereço</Label>
                        <div className="text-sm">{selectedAppointment.patient.address}</div>
                      </div>
                    )}
                    {selectedAppointment.patient?.emergencyContact && (
                      <div>
                        <Label className="text-sm text-gray-600">Contato de Emergência</Label>
                        <div className="text-sm">{selectedAppointment.patient.emergencyContact}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Medical Information */}
              {(selectedAppointment.patient?.allergies || selectedAppointment.patient?.medications || selectedAppointment.patient?.medicalHistory || selectedAppointment.patient?.patientNotes) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informações Médicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedAppointment.patient?.allergies && (
                      <div>
                        <Label className="text-sm text-gray-600">Alergias</Label>
                        <div className="text-sm bg-red-50 border border-red-200 p-3 rounded-md text-red-800">
                          {selectedAppointment.patient.allergies}
                        </div>
                      </div>
                    )}
                    {selectedAppointment.patient?.medications && (
                      <div>
                        <Label className="text-sm text-gray-600">Medicamentos</Label>
                        <div className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-md text-blue-800">
                          {selectedAppointment.patient.medications}
                        </div>
                      </div>
                    )}
                    {selectedAppointment.patient?.medicalHistory && (
                      <div>
                        <Label className="text-sm text-gray-600">Histórico Médico</Label>
                        <div className="text-sm bg-gray-50 border p-3 rounded-md">
                          {selectedAppointment.patient.medicalHistory}
                        </div>
                      </div>
                    )}
                    {selectedAppointment.patient?.patientNotes && (
                      <div>
                        <Label className="text-sm text-gray-600">Observações do Paciente</Label>
                        <div className="text-sm bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                          {selectedAppointment.patient.patientNotes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dental Procedures Section */}
              {selectedAppointment.teeth && selectedAppointment.teeth.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🦷 Procedimentos Dentais
                      <Badge variant="secondary">{selectedAppointment.teeth.length} dente{selectedAppointment.teeth.length > 1 ? 's' : ''}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {selectedAppointment.teeth.map((tooth, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {numberingSystem === NumberingSystem.FDI ? tooth.toothNumberFDI : tooth.toothNumber}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{tooth.procedure}</div>
                              {tooth.notes && (
                                <div className="text-xs text-gray-600 mt-1">{tooth.notes}</div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Dente {numberingSystem === NumberingSystem.FDI ? tooth.toothNumberFDI : tooth.toothNumber}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex space-x-2 pt-4">
                {selectedAppointment.status === 'SCHEDULED' && (
                  <Button
                    variant="default"
                    className="flex-1"
                    size="sm"
                    onClick={() => handleConfirmAppointment(selectedAppointment.id)}
                  >
                    Confirmar
                  </Button>
                )}
                {selectedAppointment.status === 'CONFIRMED' && (
                  <Button
                    variant="default"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                    onClick={() => handleCompleteAppointment(selectedAppointment.id)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Concluir
                  </Button>
                )}
                <Button variant="outline" className="flex-1" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  size="sm"
                  onClick={handleRescheduleAppointment}
                >
                  Reagendar
                </Button>
                {selectedAppointment.status !== 'CANCELLED' && selectedAppointment.status !== 'COMPLETED' && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal for adding appointment */}
      {isAddingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <Card className={`w-full ${isRescheduling ? 'max-w-4xl' : 'max-w-2xl'} h-[95vh] flex flex-col`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isRescheduling ? 'Reagendar Consulta' : 'Nova Consulta'}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsAddingAppointment(false)
                    setIsRescheduling(false)
                    setReschedulingAppointmentId(null)
                    setSelectedTimeSlot('')
                    setRescheduleDate(new Date())
                    setRescheduleTime('')
                    setPrefilledPatient(null)
                    setFoundPatient(null)
                    setAvailabilityCheck(null)
                    setFormValues({
                      patientPhone: '',
                      patientName: '',
                      type: procedures.length > 0 ? procedures[0].name : 'Consulta',
                      duration: procedures.length > 0 ? procedures[0].duration.toString() : '30',
                      notes: '',
                      clinicId: ''
                    })
                    setSelectedTeeth([])
                    setTeethProcedures([])
                    setShowTeethModal(false)

                    // Clear URL parameters
                    const url = new URL(window.location.href)
                    url.searchParams.delete('patientId')
                    url.searchParams.delete('patientName')
                    url.searchParams.delete('patientPhone')
                    url.searchParams.delete('reschedule')
                    window.history.replaceState({}, '', url.toString())
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {isRescheduling ? 
                  'Selecione a nova data e horário usando os controles abaixo' : 
                  selectedTimeSlot ? 
                    `📅 ${new Date(selectedDate).toLocaleDateString('pt-BR')} às ${selectedTimeSlot}` : 
                    'Selecione uma data e horário no calendário'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <form id="appointment-form">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Telefone/WhatsApp</Label>
                    <Input
                      id="phone"
                      name="patientPhone"
                      placeholder="(11) 99999-9999"
                      type="tel"
                      value={formValues.patientPhone}
                      onChange={(e) => {
                        const phone = e.target.value
                        setFormValues({ ...formValues, patientPhone: phone })
                        if (phone.replace(/\D/g, '').length >= 10) {
                          searchPatientByPhone(phone)
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        💡 Se o paciente já consultou antes, digite o telefone para carregar os dados automaticamente
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPatientPicker(true)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Selecionar
                      </Button>
                    </div>
                    {isSearchingPatient && (
                      <p className="text-sm text-blue-600 mt-1">Buscando paciente...</p>
                    )}
                    {foundPatient && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-green-600">
                          ✓ Paciente encontrado: {foundPatient.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="patientName">Nome do Paciente</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      placeholder="Nome completo do paciente"
                      value={formValues.patientName}
                      onChange={(e) => setFormValues({ ...formValues, patientName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email (opcional)</Label>
                      <Input id="email" name="email" placeholder="paciente@email.com" type="email" />
                    </div>

                    <div>
                      <Label htmlFor="age">Idade (opcional)</Label>
                      <Input id="age" name="patientAge" placeholder="25" type="number" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gender">Gênero (opcional)</Label>
                    <select
                      id="gender"
                      name="gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Selecione</option>
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Feminino</option>
                      <option value="OTHER">Outro</option>
                    </select>
                  </div>
                </div>
              </form>
              


              {/* Mostrar calendário apenas para reagendamento ou quando não há horário selecionado */}
              {(isRescheduling || !selectedTimeSlot) && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      📅 <strong>{isRescheduling ? 'Reagendamento:' : 'Selecionar Data e Horário:'}</strong> Use os controles abaixo para {isRescheduling ? 'escolher nova data e horário' : 'selecionar data e horário'}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <DatePicker
                        selectedDate={isRescheduling ? rescheduleDate : selectedDate}
                        onDateSelect={(date) => {
                          if (isRescheduling) {
                            setRescheduleDate(date)
                            setRescheduleTime('') // Reset time when date changes
                          } else {
                            setSelectedDate(date)
                            setSelectedTimeSlot('') // Reset time when date changes
                          }
                        }}
                        minDate={new Date()}
                      />
                    </div>
                    <div>
                      <TimeSlotPicker
                        selectedDate={isRescheduling ? rescheduleDate : selectedDate}
                        selectedTime={isRescheduling ? rescheduleTime : selectedTimeSlot}
                        onTimeSelect={(time) => {
                          if (isRescheduling) {
                            setRescheduleTime(time)
                          } else {
                            setSelectedTimeSlot(time)
                          }
                        }}
                        scheduleSettings={scheduleSettings || undefined}
                        appointments={appointments.filter(apt =>
                          apt.id !== reschedulingAppointmentId && // Exclude the appointment being rescheduled
                          new Date(apt.date).toDateString() === (isRescheduling ? rescheduleDate : selectedDate).toDateString()
                        )}
                        duration={parseInt(formValues.duration)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar informações de agendamento quando horário já foi selecionado */}
              {!isRescheduling && selectedTimeSlot && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Horário Selecionado</p>
                      <p className="text-sm">
                        📅 {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} às {selectedTimeSlot}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Preencha os dados do paciente para confirmar o agendamento
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="appointmentMode">Modo da Consulta</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={appointmentMode === 'simple' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setAppointmentMode('simple')
                      setSelectedTeeth([])
                      setTeethProcedures([])
                    }}
                    className="flex-1"
                  >
                    🩺 Consulta Simples
                  </Button>
                  <Button
                    type="button"
                    variant={appointmentMode === 'dental' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppointmentMode('dental')}
                    className="flex-1"
                  >
                    🦷 Procedimentos Dentais
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {appointmentMode === 'simple' 
                    ? 'Um procedimento para toda a consulta (ex: Consulta, Retorno, Avaliação)'
                    : 'Procedimentos específicos por dente (ex: Restauração no 11, Limpeza no 21)'
                  }
                </p>
              </div>

              {appointmentMode === 'simple' && (
                <div>
                  <Label htmlFor="type">Tipo de Procedimento</Label>
                <select
                  id="type"
                  name="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formValues.type}
                  onChange={async (e) => {
                    // O valor do select já é o nome limpo do procedimento (ex: "Canal")
                    const selectedProcedureName = e.target.value

                    const selectedProcedure = procedures.find(proc => proc.name === selectedProcedureName)
                    if (selectedProcedure) {
                      setFormValues({
                        ...formValues,
                        type: selectedProcedure.name,
                        duration: selectedProcedure.duration.toString()
                      })

                      // Verificar disponibilidade com a nova duração do procedimento
                      if (selectedTimeSlot) {
                        const [hours, minutes] = selectedTimeSlot.split(':').map(Number)
                        const appointmentDate = new Date(selectedDate)
                        appointmentDate.setHours(hours, minutes, 0, 0)
                        await checkAvailability(appointmentDate, selectedProcedure.duration)
                      }
                    }
                  }}
                >
                  {procedures.map((procedure) => (
                    <option key={procedure.id} value={procedure.name}>
                      {procedure.name} ({procedure.duration}min)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  A duração é definida automaticamente pelo procedimento selecionado
                </p>

                {/* Availability Check Results */}
                {availabilityCheck && (
                  <div className="mt-2">
                    {!availabilityCheck.available ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 font-medium">⚠️ {availabilityCheck.message}</p>
                          {availabilityCheck.conflicts && availabilityCheck.conflicts.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs text-red-600">Conflitos:</p>
                              {availabilityCheck.conflicts.map((conflict, index) => (
                                <p key={index} className="text-xs text-red-600">
                                  • {conflict.startTime} - {conflict.endTime} ({conflict.type})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {availabilityCheck.suggestions && availabilityCheck.suggestions.length > 0 && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-700 font-medium">💡 Horários alternativos:</p>
                            <div className="mt-1 space-y-1">
                              {availabilityCheck.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline block"
                                  onClick={() => {
                                    const newDate = new Date(suggestion.date)
                                    setSelectedDate(newDate)
                                    setSelectedTimeSlot(suggestion.time)
                                    setAvailabilityCheck(null)
                                  }}
                                >
                                  {suggestion.time} - {suggestion.endTime}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-700">✅ {availabilityCheck.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {appointmentMode === 'dental' && (
                <div>
                  <Label className="text-base font-medium">🦷 Consulta com Procedimentos Dentais</Label>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    Selecione os dentes e configure procedimentos específicos para cada um
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTeethModal(true)}
                      className="w-full flex items-center gap-2"
                    >
                      <span>🦷</span>
                      {selectedTeeth.length > 0 
                        ? `${selectedTeeth.length} dente${selectedTeeth.length > 1 ? 's' : ''} selecionado${selectedTeeth.length > 1 ? 's' : ''}`
                        : 'Selecionar Dentes para Procedimentos'
                      }
                    </Button>

                    {selectedTeeth.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">Dentes selecionados:</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowToothProcedureModal(true)}
                            className="text-xs"
                          >
                            ⚙️ Configurar Procedimentos
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedTeeth.map(tooth => (
                            <span key={tooth} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {getToothDisplayNumber(tooth)}
                            </span>
                          ))}
                        </div>
                        
                        {teethProcedures.length > 0 && (
                          <div className="mt-2 text-xs text-blue-600">
                            ✅ {teethProcedures.length} procedimento{teethProcedures.length > 1 ? 's' : ''} configurado{teethProcedures.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="clinic">Clínica (opcional)</Label>
                <select
                  id="clinic"
                  value={formValues.clinicId}
                  onChange={(e) => setFormValues({ ...formValues, clinicId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Selecione uma clínica</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Notas sobre a consulta..."
                  value={formValues.notes}
                  onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
                />
              </div>
              
            </CardContent>
            
            {/* Fixed footer with action buttons */}
            <div className="border-t bg-white p-4">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsAddingAppointment(false)
                    setIsRescheduling(false)
                    setReschedulingAppointmentId(null)
                    setSelectedTimeSlot('')
                    setRescheduleDate(new Date())
                    setRescheduleTime('')
                    setPrefilledPatient(null)
                    setFoundPatient(null)
                    setAvailabilityCheck(null)
                    setFormValues({
                      patientPhone: '',
                      patientName: '',
                      type: 'consultation',
                      duration: '30',
                      notes: '',
                      clinicId: ''
                    })
                    setSelectedTeeth([])
                    setTeethProcedures([])
                    setShowTeethModal(false)

                    // Clear URL parameters
                    const url = new URL(window.location.href)
                    url.searchParams.delete('patientId')
                    url.searchParams.delete('patientName')
                    url.searchParams.delete('patientPhone')
                    url.searchParams.delete('reschedule')
                    window.history.replaceState({}, '', url.toString())
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateOrRescheduleAppointment}
                >
                  {isRescheduling ? 'Reagendar' : 'Agendar'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Patient Picker Modal */}
      <PatientPicker
        isOpen={showPatientPicker}
        onClose={() => setShowPatientPicker(false)}
        onSelectPatient={handlePatientSelect}
        doctorId={userData?.doctorId || ''}
        tenantId={userData?.tenantId || ''}
      />

      {/* Modal para Seleção de Dentes */}
      {showTeethModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">🦷 Selecionar Dentes</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTeethModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clique nos dentes para selecioná-los</p>
                    {selectedTeeth.length > 0 && (
                      <p className="text-sm font-medium text-green-600">
                        {selectedTeeth.length} dente{selectedTeeth.length > 1 ? 's' : ''} selecionado{selectedTeeth.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTeeth.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTeeth([])}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Limpar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      FDI
                    </Button>
                  </div>
                </div>
                
                {/* Usar DentalChart diretamente */}
                <DentalChart
                  doctorPatientId=""
                  mode="select"
                  selectedTeeth={selectedTeeth}
                  onTeethSelect={setSelectedTeeth}
                  numberingSystem={numberingSystem}
                  showLabels={true}
                  readOnly={false}
                />
                
                {/* Lista dos dentes selecionados */}
                {selectedTeeth.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Dentes Selecionados ({selectedTeeth.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeeth.map(toothNumber => {
                        return (
                          <Badge 
                            key={toothNumber} 
                            variant="secondary"
                            className="flex items-center gap-1 cursor-pointer hover:bg-red-100"
                            onClick={() => {
                              const newSelection = selectedTeeth.filter(t => t !== toothNumber)
                              setSelectedTeeth(newSelection)
                            }}
                          >
                            {universalToFDI(toothNumber)}
                            <span className="text-xs text-gray-500">×</span>
                          </Badge>
                        )
                      })}
                    </div>
                    
                    {procedures.length > 0 && selectedTeeth.length > 0 && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setShowToothProcedureModal(true)}
                        >
                          <Edit3 className="w-4 h-4" />
                          Configurar Procedimentos por Dente
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t p-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTeethModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowTeethModal(false)}>
                Confirmar Seleção
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para configurar procedimentos por dente */}
      <ToothProcedureModal
        isOpen={showToothProcedureModal}
        onClose={() => setShowToothProcedureModal(false)}
        selectedTeeth={selectedTeeth}
        onSaveTeethProcedures={handleTeethProceduresChange}
        procedures={procedures}
        numberingSystem={numberingSystem}
      />
    </div>
  )
}

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar currentPage="calendar" />
      <div className="flex-1 overflow-hidden min-w-0">
        <CalendarPageContent />
      </div>
    </div>
  )
}