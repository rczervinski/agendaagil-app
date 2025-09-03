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
  Settings as SettingsIcon,
  LogOut,
  Calendar as CalendarIcon,
  Users, 
  MessageCircle,
  Save,
  Upload,
  Camera,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  CreditCard,
  Palette,
  Zap,
  Calendar,
  User
} from "lucide-react"
import { DashboardSidebar } from "@/components/DashboardSidebar"

// Mock data for settings
const mockSettings = {
  clinic: {
    name: 'Clínica Odontológica Silva',
    description: 'Cuidando do seu sorriso há mais de 10 anos',
    logo: null,
    address: 'Rua das Flores, 123 - Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '05432-000',
    phone: '(11) 3456-7890',
    whatsapp: '(11) 99999-0000',
    email: 'contato@clinicasilva.com.br',
    website: 'www.clinicasilva.com.br',
    cnpj: '12.345.678/0001-90'
  },
  doctor: {
    name: 'Dr. João Silva',
    cro: 'CRO-SP 12345',
    specialties: ['Clínico Geral', 'Ortodontia'],
    phone: '(11) 99999-9999',
    email: 'dr.joao@clinicasilva.com.br'
  },
  schedule: {
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workHours: {
      start: '08:00',
      end: '18:00'
    },
    lunchBreak: {
      start: '12:00',
      end: '13:00'
    },
    defaultDuration: 30,
    slotInterval: 15,
    enableLunchBreak: true,
    advanceBookingDays: 30 // days
  },
  whatsapp: {
    isConnected: true,
    autoReply: true,
    welcomeMessage: 'Olá! Aqui é o atendimento automático do Dr. João Silva. Como posso ajudar?',
    businessHours: true,
    outOfHoursMessage: 'Obrigado pela mensagem! Nosso horário de atendimento é de 8h às 18h, de segunda a sexta. Retornaremos seu contato no próximo dia útil.',
    reminderEnabled: true,
    reminderTime: 24 // hours before appointment
  },
  notifications: {
    email: true,
    sms: false,
    push: true,
    newAppointments: true,
    cancellations: true,
    reminders: true
  },
  billing: {
    plan: 'Professional',
    status: 'active',
    nextBilling: '2024-03-15',
    amount: 197.00
  }
}

function SettingsPageContent() {
  const { userData } = useAuth()
  const [settings, setSettings] = useState(mockSettings)
  const [activeTab, setActiveTab] = useState('clinic')
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData) {
      loadSettings()
    }
  }, [userData])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get form data from DOM elements
      const formData = getFormData()
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        alert('Configurações salvas com sucesso!')
        await loadSettings() // Reload to get fresh data
      } else {
        const error = await response.json()
        alert(`Erro ao salvar: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  const getFormData = () => {
    // Collect data from form fields based on active tab
    const formData: any = {}
    
    if (activeTab === 'schedule') {
      const startTime = (document.getElementById('startTime') as HTMLInputElement)?.value
      const endTime = (document.getElementById('endTime') as HTMLInputElement)?.value
      const lunchStart = (document.getElementById('lunchStart') as HTMLInputElement)?.value
      const lunchEnd = (document.getElementById('lunchEnd') as HTMLInputElement)?.value
      const duration = (document.getElementById('duration') as HTMLInputElement)?.value
      const advance = (document.getElementById('advance') as HTMLInputElement)?.value
      const slotInterval = (document.getElementById('slotInterval') as HTMLSelectElement)?.value
      const enableLunchBreak = (document.getElementById('enableLunchBreak') as HTMLInputElement)?.checked

      formData.schedule = {
        workHours: {
          start: startTime || settings.schedule.workHours.start,
          end: endTime || settings.schedule.workHours.end
        },
        lunchBreak: {
          start: lunchStart || settings.schedule.lunchBreak.start,
          end: lunchEnd || settings.schedule.lunchBreak.end
        },
        defaultDuration: duration ? parseInt(duration) : settings.schedule.defaultDuration,
        slotInterval: slotInterval ? parseInt(slotInterval) : (settings.schedule.slotInterval || 15),
        enableLunchBreak: enableLunchBreak !== undefined ? enableLunchBreak : (settings.schedule.enableLunchBreak !== false),
        advanceBookingDays: advance ? parseInt(advance) : settings.schedule.advanceBookingDays
      }
    }
    
    return formData
  }

  const tabs = [
    { id: 'clinic', label: 'Consultório', icon: MapPin },
    { id: 'doctor', label: 'Médico', icon: User },
    { id: 'schedule', label: 'Agenda', icon: Clock },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'billing', label: 'Planos & Cobrança', icon: CreditCard }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Carregando configurações...</span>
        </div>
      </div>
    )
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
              <SettingsIcon className="h-4 w-4" />
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600">Gerencie as configurações do seu consultório</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Tabs */}
            <div className="col-span-3">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <Button
                          key={tab.id}
                          variant={activeTab === tab.id ? "default" : "ghost"}
                          className="w-full justify-start text-sm"
                          onClick={() => setActiveTab(tab.id)}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {tab.label}
                        </Button>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="col-span-9">
              {activeTab === 'clinic' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Consultório</CardTitle>
                      <CardDescription>Configure os dados básicos do seu consultório</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="clinicName">Nome do Consultório</Label>
                          <Input 
                            id="clinicName" 
                            defaultValue={settings.clinic.name}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input 
                            id="cnpj" 
                            defaultValue={settings.clinic.cnpj}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Input 
                          id="description" 
                          defaultValue={settings.clinic.description}
                          placeholder="Breve descrição do consultório"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Endereço Completo</Label>
                        <Input 
                          id="address" 
                          defaultValue={settings.clinic.address}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Input 
                            id="city" 
                            defaultValue={settings.clinic.city}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <Input 
                            id="state" 
                            defaultValue={settings.clinic.state}
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">CEP</Label>
                          <Input 
                            id="zipCode" 
                            defaultValue={settings.clinic.zipCode}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Telefone</Label>
                          <Input 
                            id="phone" 
                            defaultValue={settings.clinic.phone}
                          />
                        </div>
                        <div>
                          <Label htmlFor="whatsapp">WhatsApp</Label>
                          <Input 
                            id="whatsapp" 
                            defaultValue={settings.clinic.whatsapp}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            defaultValue={settings.clinic.email}
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input 
                            id="website" 
                            defaultValue={settings.clinic.website}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="logo">Logo do Consultório</Label>
                        <div className="mt-2">
                          <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Fazer Upload da Logo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'doctor' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Médico</CardTitle>
                      <CardDescription>Configure seus dados profissionais</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="doctorName">Nome Completo</Label>
                          <Input 
                            id="doctorName" 
                            defaultValue={settings.doctor?.name || ''}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cro">CRO</Label>
                          <Input 
                            id="cro" 
                            defaultValue={settings.doctor?.cro || ''}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="specialties">Especialidades</Label>
                        <Input 
                          id="specialties" 
                          defaultValue={settings.doctor?.specialties?.join(', ') || ''}
                          placeholder="Separe as especialidades por vírgula"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="doctorPhone">Telefone</Label>
                          <Input 
                            id="doctorPhone" 
                            defaultValue={settings.doctor?.phone || ''}
                          />
                        </div>
                        <div>
                          <Label htmlFor="doctorEmail">Email</Label>
                          <Input 
                            id="doctorEmail" 
                            type="email" 
                            defaultValue={settings.doctor?.email || ''}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="photo">Foto Profissional</Label>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                          <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Fazer Upload da Foto
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações de Agenda</CardTitle>
                      <CardDescription>Defina seus horários e preferências de agendamento</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Dias de Trabalho</Label>
                        <div className="grid grid-cols-7 gap-2 mt-2">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day, index) => (
                            <div key={day} className="text-center">
                              <input
                                type="checkbox"
                                id={day}
                                defaultChecked={index >= 1 && index <= 5}
                                className="mb-1"
                              />
                              <Label htmlFor={day} className="text-xs block">{day}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startTime">Horário de Início</Label>
                          <Input 
                            id="startTime" 
                            type="time" 
                            defaultValue={settings.schedule.workHours.start}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endTime">Horário de Término</Label>
                          <Input 
                            id="endTime" 
                            type="time" 
                            defaultValue={settings.schedule.workHours.end}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <input
                            type="checkbox"
                            id="enableLunchBreak"
                            defaultChecked={settings.schedule.enableLunchBreak !== false}
                            className="rounded"
                          />
                          <Label htmlFor="enableLunchBreak">Habilitar horário de almoço</Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="lunchStart">Início do Almoço</Label>
                            <Input
                              id="lunchStart"
                              type="time"
                              defaultValue={settings.schedule.lunchBreak.start}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lunchEnd">Término do Almoço</Label>
                            <Input
                              id="lunchEnd"
                              type="time"
                              defaultValue={settings.schedule.lunchBreak.end}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="slotInterval">Intervalo dos Blocos (minutos)</Label>
                          <select
                            id="slotInterval"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={settings.schedule.slotInterval || 15}
                          >
                            <option value={15}>15 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1 hora e 30 minutos</option>
                            <option value={120}>2 horas</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Define o tamanho de cada bloco no calendário
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="duration">Duração Padrão (minutos)</Label>
                          <Input
                            id="duration"
                            type="number"
                            defaultValue={settings.schedule.defaultDuration}
                            min="15"
                            step="15"
                          />
                        </div>
                        <div>
                          <Label htmlFor="advance">Antecedência Máxima (dias)</Label>
                          <Input
                            id="advance"
                            type="number"
                            defaultValue={settings.schedule.advanceBookingDays}
                            min="1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'whatsapp' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações do WhatsApp</CardTitle>
                      <CardDescription>Configure a integração com WhatsApp Business</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-green-800">WhatsApp Conectado</p>
                            <p className="text-sm text-green-600">Número: {settings.clinic.whatsapp}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id="autoReply"
                            defaultChecked={settings.whatsapp.autoReply}
                          />
                          <Label htmlFor="autoReply">Resposta automática ativa</Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
                        <textarea
                          id="welcomeMessage"
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                          defaultValue={settings.whatsapp.welcomeMessage}
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id="businessHours"
                            defaultChecked={settings.whatsapp.businessHours}
                          />
                          <Label htmlFor="businessHours">Mensagem fora do horário comercial</Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="outOfHoursMessage">Mensagem Fora do Horário</Label>
                        <textarea
                          id="outOfHoursMessage"
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                          defaultValue={settings.whatsapp.outOfHoursMessage}
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id="reminderEnabled"
                            defaultChecked={settings.whatsapp.reminderEnabled}
                          />
                          <Label htmlFor="reminderEnabled">Lembretes automáticos</Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reminderTime">Enviar lembrete (horas antes)</Label>
                        <Input 
                          id="reminderTime" 
                          type="number" 
                          defaultValue={settings.whatsapp.reminderTime}
                          min="1" 
                          max="72"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferências de Notificações</CardTitle>
                      <CardDescription>Escolha como deseja receber notificações</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Canais de Notificação</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="emailNotif"
                              defaultChecked={settings.notifications.email}
                            />
                            <Label htmlFor="emailNotif">Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="smsNotif"
                              defaultChecked={settings.notifications.sms}
                            />
                            <Label htmlFor="smsNotif">SMS</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="pushNotif"
                              defaultChecked={settings.notifications.push}
                            />
                            <Label htmlFor="pushNotif">Push (Navegador)</Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Tipos de Notificação</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="newAppointments"
                              defaultChecked={settings.notifications.newAppointments}
                            />
                            <Label htmlFor="newAppointments">Novos agendamentos</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="cancellations"
                              defaultChecked={settings.notifications.cancellations}
                            />
                            <Label htmlFor="cancellations">Cancelamentos</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="reminders"
                              defaultChecked={settings.notifications.reminders}
                            />
                            <Label htmlFor="reminders">Lembretes de consulta</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Plano Atual</CardTitle>
                      <CardDescription>Informações sobre seu plano e faturamento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">Plano {settings.billing?.plan || 'Professional'}</h3>
                            <p className="text-blue-600">R$ {settings.billing?.amount?.toFixed(2) || '197,00'}/mês</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {settings.billing?.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-blue-800">
                          <p><strong>Próxima cobrança:</strong> {settings.billing?.nextBilling ? new Date(settings.billing.nextBilling).toLocaleDateString('pt-BR') : 'Não disponível'}</p>
                          <p><strong>Incluído no plano:</strong></p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Agendamentos ilimitados</li>
                            <li>WhatsApp Business integrado</li>
                            <li>Lembretes automáticos</li>
                            <li>Dashboard completo</li>
                            <li>Suporte por email</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex space-x-4 mt-6">
                        <Button variant="outline">
                          Alterar Plano
                        </Button>
                        <Button variant="outline">
                          Histórico de Pagamentos
                        </Button>
                        <Button variant="outline">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Atualizar Cartão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Outros Planos</CardTitle>
                      <CardDescription>Explore outros planos disponíveis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Básico</h4>
                          <p className="text-2xl font-bold mb-2">R$ 97<span className="text-sm font-normal">/mês</span></p>
                          <ul className="text-sm space-y-1">
                            <li>• Até 100 agendamentos/mês</li>
                            <li>• WhatsApp básico</li>
                            <li>• 1 usuário</li>
                          </ul>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Premium</h4>
                          <p className="text-2xl font-bold mb-2">R$ 297<span className="text-sm font-normal">/mês</span></p>
                          <ul className="text-sm space-y-1">
                            <li>• Agendamentos ilimitados</li>
                            <li>• WhatsApp + automações</li>
                            <li>• Usuários ilimitados</li>
                            <li>• Relatórios avançados</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar currentPage="settings" />
      <div className="flex-1 overflow-hidden">
        <SettingsPageContent />
      </div>
    </div>
  )
}