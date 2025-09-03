'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  User, 
  Heart, 
  CheckCircle,
  AlertCircle,
  Save,
  Clock
} from "lucide-react"

interface ClinicalRecord {
  name?: string
  rg?: string
  cpf?: string
  issuingOrgan?: string
  birthDate?: string
  nationality?: string
  maritalStatus?: string
  profession?: string
  phone?: string
  email?: string
  address?: string
  addressNumber?: string
  neighborhood?: string
  zipCode?: string
  guardianName?: string
  guardianRg?: string
  guardianCpf?: string
  guardianIssuingOrgan?: string
  guardianMaritalStatus?: string
  guardianSpouse?: string
}

interface Anamnesis {
  mainComplaint?: string
  hasDisease?: boolean
  diseaseDescription?: string
  lastDentalTreatment?: string
  lastDentalProcedure?: string
  hadDentalProblems?: boolean
  dentalProblemsDescription?: string
  currentMedicalTreatment?: boolean
  medicalTreatmentDescription?: string
  doctorName?: string
  doctorPhone?: string
  isPregnant?: boolean
  pregnancyTime?: string
  takingMedication?: boolean
  medicationDescription?: string
  medicationAllergy?: boolean
  medicationAllergyDescription?: string
  hasAnyAllergy?: boolean
  allergyDescription?: string
  hadSurgery?: boolean
  surgeryDescription?: string
  healingProblems?: boolean
  anesthesiaProblems?: boolean
  hemorrhageProblems?: boolean
  rheumaticFever?: boolean
  heartProblems?: boolean
  respiratoryProblems?: boolean
  allergicProblems?: boolean
  kidneyProblems?: boolean
  jointProblems?: boolean
  diabetesType1?: boolean
  diabetesType2?: boolean
  hypertension?: boolean
  otherDiseases?: string
  bitesNails?: boolean
  mouthBreathing?: boolean
  teethGrinding?: boolean
  otherHabits?: string
  isSmoker?: boolean
  smokingDuration?: string
  importantObservations?: string
}

interface TokenData {
  token: string
  expiresAt: string
  patient: {
    name: string
    phone: string
    email?: string
    cpf?: string
    birthDate?: string
    address?: string
    gender?: string
  }
  doctor: {
    name: string
  }
  existingData: {
    clinicalRecord?: ClinicalRecord
    anamnesis?: Anamnesis
  }
}

export default function PatientFormPage() {
  const params = useParams()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [activeTab, setActiveTab] = useState('clinical')
  
  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord>({})
  const [anamnesis, setAnamnesis] = useState<Anamnesis>({})

  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  const validateToken = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patient-form/${token}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Token inválido')
        return
      }
      
      const data = await response.json()
      setTokenData(data)

      // Pre-fill with existing data if available
      if (data.existingData.clinicalRecord) {
        setClinicalRecord(data.existingData.clinicalRecord)
      } else {
        // Auto-fill basic patient data from patient record
        const autoFilledRecord: ClinicalRecord = {
          name: data.patient.name || '',
          phone: data.patient.phone || '',
          email: data.patient.email || '',
          cpf: data.patient.cpf || '',
          birthDate: data.patient.birthDate || '',
          address: data.patient.address || '',
        }
        setClinicalRecord(autoFilledRecord)
      }

      if (data.existingData.anamnesis) {
        setAnamnesis(data.existingData.anamnesis)
      }
    } catch (error) {
      console.error('Error validating token:', error)
      setError('Erro ao validar o link')
    } finally {
      setLoading(false)
    }
  }

  const submitForm = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/patient-form/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicalRecord,
          anamnesis,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao salvar os dados')
        return
      }
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      setError('Erro ao enviar o formulário')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Entre em contato com seu dentista para obter um novo link.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Formulário Enviado!</h2>
            <p className="text-gray-600 mb-4">
              Suas informações foram salvas com sucesso.
            </p>
            <p className="text-sm text-gray-500">
              Dr. {tokenData?.doctor.name} agora tem acesso às suas fichas clínicas.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile-first Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Ficha do Paciente
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3">
              Olá, <span className="font-semibold text-blue-600">{tokenData.patient.name}</span>!
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">
              Preencha suas informações para <strong>Dr. {tokenData.doctor.name}</strong>
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Expira: {new Date(tokenData.expiresAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Content */}
      <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto">

        {/* Mobile-first Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Progresso
            </span>
            <span className="text-xs text-gray-500">
              {activeTab === 'clinical' ? '1' : '2'} de 2
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: activeTab === 'clinical' ? '50%' : '100%' }}
            ></div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile-optimized Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all ${
                activeTab === 'clinical'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <User className="h-4 w-4" />
                <span>Dados Pessoais</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('anamnesis')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all ${
                activeTab === 'anamnesis'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Saúde</span>
              </div>
            </button>
          </div>

          <TabsContent value="clinical" className="space-y-4">
            {/* Mobile-optimized Clinical Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                <div className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5" />
                  <h2 className="font-semibold">Dados Pessoais</h2>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Auto-fill Notice */}
                {tokenData?.patient && (tokenData.patient.name || tokenData.patient.phone || tokenData.patient.email) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        <strong>Dados preenchidos automaticamente!</strong> Verifique e complete as informações abaixo.
                      </p>
                    </div>
                  </div>
                )}

                {/* Nome Completo */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={clinicalRecord.name || ''}
                    onChange={(e) => setClinicalRecord({...clinicalRecord, name: e.target.value})}
                    required
                    className="w-full h-12 text-base"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                {/* RG e CPF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rg" className="text-sm font-medium text-gray-700 mb-1 block">
                      RG
                    </Label>
                    <Input
                      id="rg"
                      value={clinicalRecord.rg || ''}
                      onChange={(e) => setClinicalRecord({...clinicalRecord, rg: e.target.value})}
                      className="w-full h-12 text-base"
                      placeholder="00.000.000-0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf" className="text-sm font-medium text-gray-700 mb-1 block">
                      CPF
                    </Label>
                    <Input
                      id="cpf"
                      value={clinicalRecord.cpf || ''}
                      onChange={(e) => setClinicalRecord({...clinicalRecord, cpf: e.target.value})}
                      className="w-full h-12 text-base"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                {/* Data de Nascimento */}
                <div>
                  <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 mb-1 block">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={clinicalRecord.birthDate ? clinicalRecord.birthDate.split('T')[0] : ''}
                    onChange={(e) => setClinicalRecord({...clinicalRecord, birthDate: e.target.value})}
                    className="w-full h-12 text-base"
                  />
                </div>

                {/* Telefone e Email */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 block">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={clinicalRecord.phone || ''}
                      onChange={(e) => setClinicalRecord({...clinicalRecord, phone: e.target.value})}
                      className="w-full h-12 text-base"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={clinicalRecord.email || ''}
                      onChange={(e) => setClinicalRecord({...clinicalRecord, email: e.target.value})}
                      className="w-full h-12 text-base"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="anamnesis" className="space-y-4">
            {/* Mobile-optimized Anamnesis Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 px-4 py-3">
                <div className="flex items-center space-x-2 text-white">
                  <Heart className="h-5 w-5" />
                  <h2 className="font-semibold">Questionário de Saúde</h2>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Queixa Principal */}
                <div>
                  <Label htmlFor="mainComplaint" className="text-sm font-medium text-gray-700 mb-2 block">
                    Qual o motivo da sua consulta?
                  </Label>
                  <Textarea
                    id="mainComplaint"
                    value={anamnesis.mainComplaint || ''}
                    onChange={(e) => setAnamnesis({...anamnesis, mainComplaint: e.target.value})}
                    rows={3}
                    className="w-full text-base resize-none"
                    placeholder="Descreva o que está sentindo ou o motivo da consulta..."
                  />
                </div>

                {/* Questões de Saúde Básicas */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Questões Básicas de Saúde
                  </h3>

                  {/* Doenças */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hasDisease"
                        checked={anamnesis.hasDisease || false}
                        onCheckedChange={(checked) => setAnamnesis({...anamnesis, hasDisease: checked as boolean})}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="hasDisease" className="text-sm font-medium text-gray-700">
                          Sofre alguma doença?
                        </Label>
                        {anamnesis.hasDisease && (
                          <div className="mt-2">
                            <Input
                              placeholder="Qual doença?"
                              value={anamnesis.diseaseDescription || ''}
                              onChange={(e) => setAnamnesis({...anamnesis, diseaseDescription: e.target.value})}
                              className="w-full h-10 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tratamento Médico */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="currentMedicalTreatment"
                        checked={anamnesis.currentMedicalTreatment || false}
                        onCheckedChange={(checked) => setAnamnesis({...anamnesis, currentMedicalTreatment: checked as boolean})}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="currentMedicalTreatment" className="text-sm font-medium text-gray-700">
                          Está em tratamento médico?
                        </Label>
                        {anamnesis.currentMedicalTreatment && (
                          <div className="mt-2">
                            <Input
                              placeholder="Qual tratamento?"
                              value={anamnesis.medicalTreatmentDescription || ''}
                              onChange={(e) => setAnamnesis({...anamnesis, medicalTreatmentDescription: e.target.value})}
                              className="w-full h-10 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medicações */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="takingMedication"
                        checked={anamnesis.takingMedication || false}
                        onCheckedChange={(checked) => setAnamnesis({...anamnesis, takingMedication: checked as boolean})}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="takingMedication" className="text-sm font-medium text-gray-700">
                          Usa alguma medicação?
                        </Label>
                        {anamnesis.takingMedication && (
                          <div className="mt-2">
                            <Input
                              placeholder="Quais medicamentos?"
                              value={anamnesis.medicationDescription || ''}
                              onChange={(e) => setAnamnesis({...anamnesis, medicationDescription: e.target.value})}
                              className="w-full h-10 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alergias */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="medicationAllergy"
                        checked={anamnesis.medicationAllergy || false}
                        onCheckedChange={(checked) => setAnamnesis({...anamnesis, medicationAllergy: checked as boolean})}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="medicationAllergy" className="text-sm font-medium text-gray-700">
                          Tem alergia a medicamentos?
                        </Label>
                        {anamnesis.medicationAllergy && (
                          <div className="mt-2">
                            <Input
                              placeholder="Quais medicamentos causam alergia?"
                              value={anamnesis.medicationAllergyDescription || ''}
                              onChange={(e) => setAnamnesis({...anamnesis, medicationAllergyDescription: e.target.value})}
                              className="w-full h-10 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Histórico Odontológico */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Histórico Odontológico
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="lastDentalTreatment" className="text-sm font-medium text-gray-700 mb-1 block">
                        Quando foi sua última consulta no dentista?
                      </Label>
                      <Input
                        id="lastDentalTreatment"
                        value={anamnesis.lastDentalTreatment || ''}
                        onChange={(e) => setAnamnesis({...anamnesis, lastDentalTreatment: e.target.value})}
                        className="w-full h-10 text-sm"
                        placeholder="Ex: 6 meses atrás, 1 ano..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastDentalProcedure" className="text-sm font-medium text-gray-700 mb-1 block">
                        Qual foi o procedimento?
                      </Label>
                      <Input
                        id="lastDentalProcedure"
                        value={anamnesis.lastDentalProcedure || ''}
                        onChange={(e) => setAnamnesis({...anamnesis, lastDentalProcedure: e.target.value})}
                        className="w-full h-10 text-sm"
                        placeholder="Ex: limpeza, obturação, extração..."
                      />
                    </div>
                  </div>
                </div>

                {/* Condições de Saúde Importantes */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Condições de Saúde
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <Checkbox
                        id="heartProblems"
                        checked={anamnesis.heartProblems || false}
                        onCheckedChange={(checked) => setAnamnesis({...anamnesis, heartProblems: checked as boolean})}
                      />
                      <Label htmlFor="heartProblems" className="text-sm font-medium text-gray-700">
                        Problemas do Coração
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <Checkbox
                        id="diabetesType2"
                        checked={anamnesis.diabetesType2 || false}
                        onCheckedChange={(checked) => setAnamnesis({...anamnesis, diabetesType2: checked as boolean})}
                      />
                      <Label htmlFor="diabetesType2" className="text-sm font-medium text-gray-700">
                        Diabetes
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <Checkbox
                        id="hypertension"
                        checked={anamnesis.hypertension || false}
                        onCheckedChange={(checked) => setAnamnesis({...anamnesis, hypertension: checked as boolean})}
                      />
                      <Label htmlFor="hypertension" className="text-sm font-medium text-gray-700">
                        Pressão Alta
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <Checkbox
                        id="isSmoker"
                        checked={anamnesis.isSmoker || false}
                        onCheckedChange={(checked) => setAnamnesis({...anamnesis, isSmoker: checked as boolean})}
                      />
                      <Label htmlFor="isSmoker" className="text-sm font-medium text-gray-700">
                        Fumante
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Observações Finais */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Informações Adicionais
                  </h3>

                  <div>
                    <Label htmlFor="importantObservations" className="text-sm font-medium text-gray-700 mb-2 block">
                      Algo mais que considera importante?
                    </Label>
                    <Textarea
                      id="importantObservations"
                      value={anamnesis.importantObservations || ''}
                      onChange={(e) => setAnamnesis({...anamnesis, importantObservations: e.target.value})}
                      rows={3}
                      className="w-full text-sm resize-none"
                      placeholder="Descreva qualquer outra informação que considera relevante para sua consulta..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Mobile-optimized Submit Section */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-8">
          <div className="space-y-3">
            <Button
              onClick={submitForm}
              disabled={saving}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              {saving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-5 w-5" />
                  <span>Enviar Formulário</span>
                </div>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                🔒 Suas informações serão enviadas de forma segura para<br />
                <strong>Dr. {tokenData.doctor.name}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
