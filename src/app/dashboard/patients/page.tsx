'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Smile,
  Bell,
  Settings,
  LogOut,
  Calendar as CalendarIcon,
  Users, 
  MessageCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  X,
  Eye,
  User,
  Calendar,
  Clock,
  FileText
} from "lucide-react"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { PatientAppointmentHistory } from "@/components/PatientAppointmentHistory"
import { PatientRecordsManager } from "@/components/PatientRecordsManager"

type PatientData = {
  id: string;
  doctorPatientId: string;
  name: string;
  email: string | null;
  phone: string;
  birthDate: string | null;
  address: string | null;
  cpf: string | null;
  gender: string | null;
  notes: string | null;
  allergies: string | null;
  medications: string | null;
  emergencyContact: string | null;
  contactSource: string | null;
  whatsappId: string | null;
  lastContact: string | null;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

type PatientStats = {
  totalPatients: number;
  activePatients: number;
  upcomingAppointments: number;
  newPatientsThisMonth: number;
}

function PatientsPageContent() {
  const { userData, loading: authLoading } = useAuth()
  const [patients, setPatients] = useState<PatientData[]>([])
  const [stats, setStats] = useState<PatientStats>({
    totalPatients: 0,
    activePatients: 0,
    upcomingAppointments: 0,
    newPatientsThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [patientAppointmentCounts, setPatientAppointmentCounts] = useState<{[key: string]: number}>({})
  const [showAppointmentHistory, setShowAppointmentHistory] = useState(false)
  const [showPatientRecords, setShowPatientRecords] = useState(false)

  useEffect(() => {
    if (userData && userData.doctorId && userData.doctorId !== 'loading' && userData.tenantId && userData.tenantId !== 'loading') {
      console.log('useEffect triggered - userData ready:', userData)
      loadPatients()
      loadStats()
    } else {
      console.log('useEffect triggered - userData not ready:', userData)
    }
  }, [userData])

  useEffect(() => {
    if (patients.length > 0) {
      loadPatientAppointmentCounts()
    }
  }, [patients])

  const loadPatients = async () => {
    if (!userData || userData.doctorId === 'loading' || !userData.doctorId || !userData.tenantId) {
      console.log('Skipping patient load - userData not ready:', userData)
      return
    }
    
    try {
      setLoading(true)
      console.log('Loading patients with IDs:', { doctorId: userData.doctorId, tenantId: userData.tenantId })
      const response = await fetch(`/api/patients?doctorId=${userData.doctorId}&tenantId=${userData.tenantId}`)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`Failed to load patients: ${response.status} ${errorText}`)
      }
      const data = await response.json()
      setPatients(data)
    } catch (error) {
      console.error('Error loading patients:', error)
      setPatients([]) // Set empty array to prevent filter error
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!userData || !userData.doctorId || userData.doctorId === 'loading' || !userData.tenantId || userData.tenantId === 'loading') {
      console.log('Skipping stats load - userData not ready:', userData)
      return
    }
    
    try {
      console.log('Loading patient stats with IDs:', { doctorId: userData.doctorId, tenantId: userData.tenantId })
      const response = await fetch(`/api/patients/stats?doctorId=${userData.doctorId}&tenantId=${userData.tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        console.log('Patient stats loaded:', data)
      } else {
        console.error('Failed to load patient stats:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Error loading patient stats:', error)
    }
  }

  const loadPatientAppointmentCounts = async () => {
    if (!userData || !userData.doctorId || userData.doctorId === 'loading') {
      console.log('Skipping appointment counts - userData not ready:', userData)
      return
    }

    try {
      // For now, we'll load this information when needed for each patient
      // In a production app, you might want to batch this or include it in the main patients API
      const counts: {[key: string]: number} = {}

      // Load counts for visible patients
      if (patients.length > 0) {
        console.log('Loading appointment counts for', patients.length, 'patients')
        await Promise.all(
          patients.map(async (patient) => {
            if (!patient.id) {
              console.warn('Patient missing ID:', patient)
              counts[patient.id] = 0
              return
            }
            
            try {
              const response = await fetch(`/api/patients/${patient.id}/appointments?doctorId=${userData.doctorId}`)
              if (response.ok) {
                const data = await response.json()
                counts[patient.id] = data.stats.total || 0
              } else {
                console.error(`Failed to load appointments for patient ${patient.id}:`, response.status, response.statusText)
                counts[patient.id] = 0
              }
            } catch (error) {
              console.error(`Error loading appointments for patient ${patient.id}:`, error)
              counts[patient.id] = 0
            }
          })
        )
      }

      setPatientAppointmentCounts(counts)
    } catch (error) {
      console.error('Error loading patient appointment counts:', error)
    }
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [isEditingPatient, setIsEditingPatient] = useState(false)

  const filteredPatients = (patients || []).filter(patient => {
    const searchLower = searchTerm.toLowerCase()
    const cleanSearchTerm = searchTerm.replace(/\D/g, '') // Remove non-digits for phone search

    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.phone.includes(cleanSearchTerm) || // Search in stored phone (numbers only)
      patient.phone.includes(searchTerm) || // Search in formatted phone
      (patient.email && patient.email.toLowerCase().includes(searchLower))
    )
  })

  const handleDeletePatient = (patientId: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      setPatients(patients.filter(p => p.id !== patientId))
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  const formatGender = (gender: string | null): string => {
    if (!gender) return 'Não informado'
    switch (gender) {
      case 'MALE': return 'Masculino'
      case 'FEMALE': return 'Feminino'
      case 'OTHER': return 'Outro'
      default: return gender
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

      <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
              <p className="text-gray-600">Gerencie o cadastro de todos os seus pacientes</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/patients/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo Paciente
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Pacientes</p>
                    <p className="text-xl font-bold">{stats.totalPatients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ativos</p>
                    <p className="text-xl font-bold">{stats.activePatients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Próximas Consultas</p>
                    <p className="text-xl font-bold">{stats.upcomingAppointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Novos Este Mês</p>
                    <p className="text-xl font-bold">{stats.newPatientsThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar pacientes por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Patients List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pacientes ({filteredPatients.length})</CardTitle>
              {filteredPatients.length > 3 && (
                <p className="text-sm text-gray-500 mt-1">
                  Role para baixo para ver mais pacientes
                </p>
              )}
            </CardHeader>
            <CardContent>
              {(loading || authLoading) ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className={`space-y-4 ${filteredPatients.length > 3 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                  {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-600">
                          {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{patient.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{calculateAge(patient.birthDate)} anos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{patientAppointmentCounts[patient.id] || 0} consultas</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {/* TODO: Show next appointment from database */}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsEditingPatient(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePatient(patient.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  ))}
                  
                  {filteredPatients.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum paciente encontrado</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Patient Details Modal */}
      {selectedPatient && !isEditingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {selectedPatient.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <CardTitle>{selectedPatient.name}</CardTitle>
                    <CardDescription>
                      {calculateAge(selectedPatient.birthDate)} anos • {formatGender(selectedPatient.gender)}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Idade</p>
                        <p className="text-lg font-semibold">{calculateAge(selectedPatient.birthDate)} anos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Consultas</p>
                        <p className="text-lg font-semibold">{patientAppointmentCounts[selectedPatient.id] || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Último Contato</p>
                        <p className="text-xs font-medium">
                          {selectedPatient.lastContact 
                            ? new Date(selectedPatient.lastContact).toLocaleDateString('pt-BR')
                            : 'Nunca'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-blue-600" />
                      Informações de Contato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Telefone:</span>
                      <span className="font-medium">{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium">{selectedPatient.email || 'Não informado'}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-gray-600">Endereço:</span>
                      <span className="font-medium text-right max-w-[200px]">
                        {selectedPatient.address || 'Não informado'}
                      </span>
                    </div>
                    {selectedPatient.whatsappId && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">WhatsApp ID:</span>
                        <span className="font-medium">{selectedPatient.whatsappId}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Origem:</span>
                      <Badge variant="outline">
                        {selectedPatient.contactSource === 'WHATSAPP' ? 'WhatsApp' :
                         selectedPatient.contactSource === 'WEBSITE' ? 'Site' :
                         selectedPatient.contactSource === 'REFERRAL' ? 'Indicação' : 'Manual'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-green-600" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CPF:</span>
                      <span className="font-medium">{selectedPatient.cpf || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Gênero:</span>
                      <span className="font-medium">{formatGender(selectedPatient.gender)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data de Nascimento:</span>
                      <span className="font-medium">
                        {selectedPatient.birthDate 
                          ? new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR')
                          : 'Não informado'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cadastro:</span>
                      <span className="font-medium">
                        {new Date(selectedPatient.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedPatient.status)}>
                        {selectedPatient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Information */}
                {(selectedPatient.allergies || selectedPatient.medications) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-red-600" />
                        Informações Médicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedPatient.allergies && (
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">Alergias:</span>
                          <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                            <span className="text-sm text-red-800">{selectedPatient.allergies}</span>
                          </div>
                        </div>
                      )}
                      {selectedPatient.medications && (
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">Medicamentos:</span>
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                            <span className="text-sm text-blue-800">{selectedPatient.medications}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Emergency Contact */}
                {selectedPatient.emergencyContact && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-orange-600" />
                        Contato de Emergência
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                        <span className="text-sm text-orange-800">{selectedPatient.emergencyContact}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Appointment History Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                      Histórico de Consultas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total de Consultas:</span>
                        <span className="font-semibold">{patientAppointmentCounts[selectedPatient.id] || 0}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowAppointmentHistory(true)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Histórico Completo
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Section */}
              {selectedPatient.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      Observações Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedPatient.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditingPatient(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPatientRecords(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Fichas
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Redirect to calendar with patient data pre-filled
                    const params = new URLSearchParams({
                      patientId: selectedPatient.id,
                      patientName: selectedPatient.name,
                      patientPhone: selectedPatient.phone
                    })
                    window.location.href = `/dashboard/calendar?${params.toString()}`
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appointment History Modal */}
      {showAppointmentHistory && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Consultas - {selectedPatient.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAppointmentHistory(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PatientAppointmentHistory 
                patientId={selectedPatient.id}
                patientName={selectedPatient.name}
                doctorId={userData?.doctorId || userData?.id || ''}
                onNewAppointment={() => {
                  setShowAppointmentHistory(false)
                  setSelectedPatient(null)
                  // Redirect to calendar with patient data pre-filled
                  const params = new URLSearchParams({
                    patientId: selectedPatient.id,
                    patientName: selectedPatient.name,
                    patientPhone: selectedPatient.phone
                  })
                  window.location.href = `/dashboard/calendar?${params.toString()}`
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Patient Modal */}
      {(isAddingPatient || isEditingPatient) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {isEditingPatient ? 'Editar Paciente' : 'Novo Paciente'}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsAddingPatient(false)
                    setIsEditingPatient(false)
                    setSelectedPatient(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Nome completo do paciente"
                    defaultValue={selectedPatient?.name || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@exemplo.com"
                    defaultValue={selectedPatient?.email || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input 
                    id="phone" 
                    placeholder="(11) 99999-9999"
                    defaultValue={selectedPatient?.phone || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf" 
                    placeholder="000.000.000-00"
                    defaultValue={selectedPatient?.cpf || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input 
                    id="birthDate" 
                    type="date"
                    defaultValue={selectedPatient?.birthDate || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    defaultValue={selectedPatient?.gender || ''}
                  >
                    <option value="">Selecione</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input 
                  id="address" 
                  placeholder="Rua, número, bairro, cidade, UF"
                  defaultValue={selectedPatient?.address || ''}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allergies">Alergias</Label>
                  <textarea
                    id="allergies"
                    placeholder="Alergias conhecidas do paciente..."
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={selectedPatient?.allergies || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="medications">Medicamentos</Label>
                  <textarea
                    id="medications"
                    placeholder="Medicamentos em uso..."
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={selectedPatient?.medications || ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                <Input 
                  id="emergencyContact" 
                  placeholder="Nome e telefone do contato de emergência"
                  defaultValue={selectedPatient?.emergencyContact || ''}
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações Gerais</Label>
                <textarea
                  id="notes"
                  placeholder="Observações gerais sobre o paciente..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={selectedPatient?.notes || ''}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsAddingPatient(false)
                    setIsEditingPatient(false)
                    setSelectedPatient(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // Aqui salvaria os dados
                    setIsAddingPatient(false)
                    setIsEditingPatient(false)
                    setSelectedPatient(null)
                  }}
                >
                  {isEditingPatient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Patient Records Modal */}
      {showPatientRecords && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <PatientRecordsManager
                doctorPatientId={selectedPatient.doctorPatientId}
                patientName={selectedPatient.name}
                doctorName={userData?.firstName + ' ' + userData?.lastName || 'Doutor'}
                onClose={() => setShowPatientRecords(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function PatientsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar currentPage="patients" />
      <div className="flex-1 overflow-hidden">
        <PatientsPageContent />
      </div>
    </div>
  )
}