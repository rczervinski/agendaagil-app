'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MaskedInput } from "@/components/ui/masked-input"
import { useFormValidation, validationUtils } from "@/hooks/useFormValidation"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  Save,
  UserPlus,
  Clock
} from "lucide-react"

interface PatientFormData {
  name: string
  phone: string
  email: string
  age: string
  cpf: string
  address: string
  city: string
  state: string
  zipCode: string
  emergencyContact: string
  emergencyPhone: string
  medicalNotes: string
  allergies: string
  medications: string
  createAppointment: boolean
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  appointmentDuration: string
}

export default function NewPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Validation rules
  const validationRules = {
    name: [
      { required: true, message: 'Nome é obrigatório' },
      { minLength: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
    ],
    phone: [
      { required: true, message: 'Telefone é obrigatório' },
      { custom: validationUtils.isValidPhone, message: 'Telefone inválido' }
    ],
    email: [
      { custom: (value: string) => !value || validationUtils.isValidEmail(value), message: 'E-mail inválido' }
    ],
    cpf: [
      { custom: (value: string) => !value || validationUtils.isValidCPF(value), message: 'CPF inválido' }
    ],
    zipCode: [
      { custom: (value: string) => !value || validationUtils.isValidZipCode(value), message: 'CEP inválido' }
    ],
    age: [
      { custom: (value: string) => !value || (parseInt(value) >= 0 && parseInt(value) <= 150), message: 'Idade deve estar entre 0 e 150 anos' }
    ]
  }

  const { validateForm, validateSingleField, setFieldTouched, hasError, getError, clearErrors } = useFormValidation(validationRules)

  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    phone: '',
    email: '',
    age: '',
    cpf: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalNotes: '',
    allergies: '',
    medications: '',
    createAppointment: false,
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'Consulta',
    appointmentDuration: '30'
  })

  const handleInputChange = (field: keyof PatientFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Validate field on change if it's a string field
    if (typeof value === 'string') {
      validateSingleField(field, value)
    }
  }

  const handleFieldBlur = (field: keyof PatientFormData, value: string) => {
    setFieldTouched(field)
    validateSingleField(field, value)
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate entire form
    const formDataForValidation = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      cpf: formData.cpf,
      zipCode: formData.zipCode,
      age: formData.age
    }

    if (!validateForm(formDataForValidation)) {
      alert('Por favor, corrija os erros no formulário antes de continuar.')
      return
    }

    // Additional validation for appointment fields if creating appointment
    if (formData.createAppointment) {
      if (!formData.appointmentDate || !formData.appointmentTime) {
        alert('Data e horário são obrigatórios para agendar consulta.')
        return
      }
    }

    setLoading(true)
    
    try {
      // Create patient
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          email: formData.email.trim() || undefined,
          age: formData.age ? parseInt(formData.age) : undefined,
          cpf: formData.cpf.replace(/\D/g, '') || undefined,
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          zipCode: formData.zipCode.replace(/\D/g, '') || undefined,
          emergencyContact: formData.emergencyContact.trim() || undefined,
          emergencyPhone: formData.emergencyPhone.replace(/\D/g, '') || undefined,
          medicalNotes: formData.medicalNotes.trim() || undefined,
          allergies: formData.allergies.trim() || undefined,
          medications: formData.medications.trim() || undefined,
        }),
      })

      if (!patientResponse.ok) {
        const error = await patientResponse.json()
        throw new Error(error.error || 'Erro ao criar paciente')
      }

      const patient = await patientResponse.json()

      // Create appointment if requested
      if (formData.createAppointment && formData.appointmentDate && formData.appointmentTime) {
        const [hours, minutes] = formData.appointmentTime.split(':').map(Number)
        const appointmentDate = new Date(formData.appointmentDate)
        appointmentDate.setHours(hours, minutes, 0, 0)

        const appointmentResponse = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientId: patient.id,
            userId: 'cm4ggqhqr0000w3m1ggc460yw', // TODO: Get from session
            date: appointmentDate.toISOString(),
            duration: parseInt(formData.appointmentDuration),
            type: formData.appointmentType,
            status: 'SCHEDULED',
          }),
        })

        if (!appointmentResponse.ok) {
          console.error('Erro ao criar consulta, mas paciente foi criado com sucesso')
          alert('Paciente registrado com sucesso, mas houve erro ao criar a consulta. Você pode agendar manualmente.')
          router.push('/dashboard/patients')
          return
        } else {
          alert('Paciente registrado e consulta agendada com sucesso!')
          router.push('/dashboard/calendar')
          return
        }
      }

      alert('Paciente registrado com sucesso!')
      router.push('/dashboard/patients')
      
    } catch (error) {
      console.error('Error creating patient:', error)
      alert(`Erro ao registrar paciente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Breadcrumbs */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <Link href="/dashboard/patients" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600">
                  Pacientes
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500">Novo Paciente</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/patients">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
                <p className="text-gray-600">Registre um novo paciente no sistema</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Link href="/dashboard/calendar">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Agenda
                </Button>
              </Link>
              <Link href="/dashboard/patients">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Lista de Pacientes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Dados básicos do paciente (* campos obrigatórios)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={(e) => handleFieldBlur('name', e.target.value)}
                    placeholder="Nome completo do paciente"
                    className={hasError('name') ? 'border-red-500' : ''}
                    required
                  />
                  {hasError('name') && (
                    <p className="text-sm text-red-500 mt-1">{getError('name')}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    onBlur={(e) => handleFieldBlur('age', e.target.value)}
                    placeholder="Idade em anos"
                    className={hasError('age') ? 'border-red-500' : ''}
                    min="0"
                    max="150"
                  />
                  {hasError('age') && (
                    <p className="text-sm text-red-500 mt-1">{getError('age')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <MaskedInput
                    id="phone"
                    mask="phone"
                    value={formData.phone}
                    onValueChange={(rawValue, maskedValue) => handleInputChange('phone', rawValue)}
                    onBlur={(e) => handleFieldBlur('phone', formData.phone)}
                    placeholder="(11) 99999-9999"
                    className={hasError('phone') ? 'border-red-500' : ''}
                    required
                  />
                  {hasError('phone') && (
                    <p className="text-sm text-red-500 mt-1">{getError('phone')}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => handleFieldBlur('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className={hasError('email') ? 'border-red-500' : ''}
                  />
                  {hasError('email') && (
                    <p className="text-sm text-red-500 mt-1">{getError('email')}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <MaskedInput
                  id="cpf"
                  mask="cpf"
                  value={formData.cpf}
                  onValueChange={(rawValue, maskedValue) => handleInputChange('cpf', rawValue)}
                  onBlur={(e) => handleFieldBlur('cpf', formData.cpf)}
                  placeholder="000.000.000-00"
                  className={hasError('cpf') ? 'border-red-500' : ''}
                />
                {hasError('cpf') && (
                  <p className="text-sm text-red-500 mt-1">{getError('cpf')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Endereço
              </CardTitle>
              <CardDescription>
                Informações de localização do paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <MaskedInput
                    id="zipCode"
                    mask="zipCode"
                    value={formData.zipCode}
                    onValueChange={(rawValue, maskedValue) => handleInputChange('zipCode', rawValue)}
                    onBlur={(e) => handleFieldBlur('zipCode', formData.zipCode)}
                    placeholder="00000-000"
                    className={hasError('zipCode') ? 'border-red-500' : ''}
                  />
                  {hasError('zipCode') && (
                    <p className="text-sm text-red-500 mt-1">{getError('zipCode')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contato de Emergência
              </CardTitle>
              <CardDescription>
                Pessoa para contatar em caso de emergência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Nome do Contato</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Telefone do Contato</Label>
                  <MaskedInput
                    id="emergencyPhone"
                    mask="phone"
                    value={formData.emergencyPhone}
                    onValueChange={(rawValue, maskedValue) => handleInputChange('emergencyPhone', rawValue)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informações Médicas
              </CardTitle>
              <CardDescription>
                Histórico médico e observações importantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="Liste alergias conhecidas (medicamentos, alimentos, etc.)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="medications">Medicamentos em Uso</Label>
                <Textarea
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  placeholder="Liste medicamentos que o paciente está tomando atualmente"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="medicalNotes">Observações Médicas</Label>
                <Textarea
                  id="medicalNotes"
                  value={formData.medicalNotes}
                  onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
                  placeholder="Observações gerais, histórico médico, condições especiais..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Agendar Consulta
              </CardTitle>
              <CardDescription>
                Opcionalmente, agende uma consulta para este paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createAppointment"
                  checked={formData.createAppointment}
                  onCheckedChange={(checked) => handleInputChange('createAppointment', checked as boolean)}
                />
                <Label htmlFor="createAppointment">
                  Criar consulta após registrar paciente
                </Label>
              </div>

              {formData.createAppointment && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Detalhes da Consulta</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appointmentDate">Data da Consulta *</Label>
                      <Input
                        id="appointmentDate"
                        type="date"
                        value={formData.appointmentDate}
                        onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={!formData.appointmentDate && formData.createAppointment ? 'border-red-300' : ''}
                      />
                      {!formData.appointmentDate && formData.createAppointment && (
                        <p className="text-sm text-red-500 mt-1">Data é obrigatória para agendar consulta</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="appointmentTime">Horário *</Label>
                      <Select
                        value={formData.appointmentTime}
                        onValueChange={(value) => handleInputChange('appointmentTime', value)}
                      >
                        <SelectTrigger className={!formData.appointmentTime && formData.createAppointment ? 'border-red-300' : ''}>
                          <SelectValue placeholder="Selecione um horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!formData.appointmentTime && formData.createAppointment && (
                        <p className="text-sm text-red-500 mt-1">Horário é obrigatório para agendar consulta</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appointmentType">Tipo de Consulta</Label>
                      <Select
                        value={formData.appointmentType}
                        onValueChange={(value) => handleInputChange('appointmentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Consulta">Consulta</SelectItem>
                          <SelectItem value="Consulta Completa">Consulta Completa</SelectItem>
                          <SelectItem value="Retorno">Retorno</SelectItem>
                          <SelectItem value="Procedimento">Procedimento</SelectItem>
                          <SelectItem value="Limpeza">Limpeza</SelectItem>
                          <SelectItem value="Tratamento de Canal">Tratamento de Canal</SelectItem>
                          <SelectItem value="Extração">Extração</SelectItem>
                          <SelectItem value="Emergência">Emergência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="appointmentDuration">Duração (minutos)</Label>
                      <Select
                        value={formData.appointmentDuration}
                        onValueChange={(value) => handleInputChange('appointmentDuration', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">60 minutos</SelectItem>
                          <SelectItem value="90">90 minutos</SelectItem>
                          <SelectItem value="120">120 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="text-red-500">*</span>
              <span>Campos obrigatórios</span>
            </div>

            <div className="flex space-x-4">
              <Link href="/dashboard/patients">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>

              {formData.createAppointment ? (
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Registrar e Agendar
                    </>
                  )}
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Paciente
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
