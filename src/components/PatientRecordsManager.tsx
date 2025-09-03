'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DentalChart } from "@/components/dental/DentalChart"
import { 
  FileText, 
  User, 
  Heart, 
  Link as LinkIcon, 
  Copy, 
  Check,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Save,
  Edit,
  Eye,
  EyeOff
} from "lucide-react"

interface PatientRecordsManagerProps {
  doctorPatientId: string
  patientName: string
  doctorName: string
  onClose?: () => void
}

interface ClinicalRecord {
  id?: string
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
  id?: string
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

interface PatientFormToken {
  token: string
  url: string
  expiresAt: string
  used?: boolean
  expired?: boolean
}

export function PatientRecordsManager({ 
  doctorPatientId, 
  patientName, 
  doctorName,
  onClose 
}: PatientRecordsManagerProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord>({})
  const [anamnesis, setAnamnesis] = useState<Anamnesis>({})
  const [patientFormToken, setPatientFormToken] = useState<PatientFormToken | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [editingClinical, setEditingClinical] = useState(false)
  const [editingAnamnesis, setEditingAnamnesis] = useState(false)

  useEffect(() => {
    loadRecords()
    loadPatientFormToken()
  }, [doctorPatientId])

  const loadRecords = async () => {
    try {
      setLoading(true)
      
      // Load clinical record
      const clinicalResponse = await fetch(`/api/doctor-patients/${doctorPatientId}/clinical-record`)
      if (clinicalResponse.ok) {
        const clinicalData = await clinicalResponse.json()
        setClinicalRecord(clinicalData.clinicalRecord || {})
      }

      // Load anamnesis
      const anamnesisResponse = await fetch(`/api/doctor-patients/${doctorPatientId}/anamnesis`)
      if (anamnesisResponse.ok) {
        const anamnesisData = await anamnesisResponse.json()
        setAnamnesis(anamnesisData.anamnesis || {})
      }
    } catch (error) {
      console.error('Error loading records:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPatientFormToken = async () => {
    try {
      const response = await fetch(`/api/doctor-patients/${doctorPatientId}/patient-form-token`)
      if (response.ok) {
        const data = await response.json()
        if (data.token) {
          setPatientFormToken(data)
        }
      }
    } catch (error) {
      console.error('Error loading patient form token:', error)
    }
  }

  const generatePatientFormLink = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/doctor-patients/${doctorPatientId}/patient-form-token`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        setPatientFormToken(data)
      } else {
        console.error('Failed to generate patient form link')
      }
    } catch (error) {
      console.error('Error generating patient form link:', error)
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const saveClinicalRecord = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/doctor-patients/${doctorPatientId}/clinical-record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clinicalRecord),
      })
      
      if (response.ok) {
        const data = await response.json()
        setClinicalRecord(data)
        setEditingClinical(false)
      } else {
        console.error('Failed to save clinical record')
      }
    } catch (error) {
      console.error('Error saving clinical record:', error)
    } finally {
      setSaving(false)
    }
  }

  const saveAnamnesis = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/doctor-patients/${doctorPatientId}/anamnesis`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(anamnesis),
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnamnesis(data)
        setEditingAnamnesis(false)
      } else {
        console.error('Failed to save anamnesis')
      }
    } catch (error) {
      console.error('Error saving anamnesis:', error)
    } finally {
      setSaving(false)
    }
  }

  const hasData = (obj: any) => {
    return Object.values(obj).some(value => 
      value !== null && value !== undefined && value !== '' && value !== false
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fichas do Paciente</h2>
          <p className="text-gray-600">{patientName} • Dr. {doctorName}</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clinical">Ficha Clínica</TabsTrigger>
          <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
          <TabsTrigger value="dental-chart">🦷 Arca Dentária</TabsTrigger>
          <TabsTrigger value="patient-link">Link do Paciente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ficha Clínica</p>
                    <p className="text-lg font-semibold">
                      {hasData(clinicalRecord) ? 'Preenchida' : 'Pendente'}
                    </p>
                    {hasData(clinicalRecord) && (
                      <Badge variant="secondary" className="mt-1">
                        <Check className="h-3 w-3 mr-1" />
                        Completa
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Anamnese</p>
                    <p className="text-lg font-semibold">
                      {hasData(anamnesis) ? 'Preenchida' : 'Pendente'}
                    </p>
                    {hasData(anamnesis) && (
                      <Badge variant="secondary" className="mt-1">
                        <Check className="h-3 w-3 mr-1" />
                        Completa
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Link do Paciente</p>
                    <p className="text-lg font-semibold">
                      {patientFormToken ? 'Gerado' : 'Não gerado'}
                    </p>
                    {patientFormToken && (
                      <Badge 
                        variant={patientFormToken.used ? "outline" : patientFormToken.expired ? "destructive" : "default"}
                        className="mt-1"
                      >
                        {patientFormToken.used ? 'Usado' : patientFormToken.expired ? 'Expirado' : 'Ativo'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Ficha Clínica</span>
                </CardTitle>
                <div className="flex space-x-2">
                  {!editingClinical && hasData(clinicalRecord) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingClinical(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  {editingClinical && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingClinical(false)
                          loadRecords() // Reset changes
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveClinicalRecord}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasData(clinicalRecord) && !editingClinical ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Ficha clínica não preenchida</p>
                  <Button onClick={() => setEditingClinical(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Preencher Ficha
                  </Button>
                </div>
              ) : (
                <>
                  {/* Dados Pessoais */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        {editingClinical ? (
                          <Input
                            id="name"
                            value={clinicalRecord.name || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, name: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.name || '-'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="rg">RG</Label>
                        {editingClinical ? (
                          <Input
                            id="rg"
                            value={clinicalRecord.rg || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, rg: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.rg || '-'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        {editingClinical ? (
                          <Input
                            id="cpf"
                            value={clinicalRecord.cpf || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, cpf: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.cpf || '-'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="issuingOrgan">Órgão Expedidor</Label>
                        {editingClinical ? (
                          <Input
                            id="issuingOrgan"
                            value={clinicalRecord.issuingOrgan || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, issuingOrgan: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.issuingOrgan || '-'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        {editingClinical ? (
                          <Input
                            id="birthDate"
                            type="date"
                            value={clinicalRecord.birthDate ? clinicalRecord.birthDate.split('T')[0] : ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, birthDate: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">
                            {clinicalRecord.birthDate ? new Date(clinicalRecord.birthDate).toLocaleDateString('pt-BR') : '-'}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nacionalidade</Label>
                        {editingClinical ? (
                          <Input
                            id="nationality"
                            value={clinicalRecord.nationality || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, nationality: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.nationality || '-'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="maritalStatus">Estado Civil</Label>
                        {editingClinical ? (
                          <Input
                            id="maritalStatus"
                            value={clinicalRecord.maritalStatus || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, maritalStatus: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.maritalStatus || '-'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="profession">Profissão</Label>
                        {editingClinical ? (
                          <Input
                            id="profession"
                            value={clinicalRecord.profession || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, profession: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.profession || '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contato</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Celular</Label>
                        {editingClinical ? (
                          <Input
                            id="phone"
                            value={clinicalRecord.phone || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, phone: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.phone || '-'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        {editingClinical ? (
                          <Input
                            id="email"
                            type="email"
                            value={clinicalRecord.email || ''}
                            onChange={(e) => setClinicalRecord({...clinicalRecord, email: e.target.value})}
                          />
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{clinicalRecord.email || '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anamnesis" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Ficha de Anamnese</span>
                </CardTitle>
                <div className="flex space-x-2">
                  {!editingAnamnesis && hasData(anamnesis) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAnamnesis(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  {editingAnamnesis && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAnamnesis(false)
                          loadRecords() // Reset changes
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveAnamnesis}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasData(anamnesis) && !editingAnamnesis ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Anamnese não preenchida</p>
                  <Button onClick={() => setEditingAnamnesis(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Preencher Anamnese
                  </Button>
                </div>
              ) : (
                <>
                  {/* Queixa Principal */}
                  <div>
                    <Label htmlFor="mainComplaint">Queixa Principal</Label>
                    {editingAnamnesis ? (
                      <Textarea
                        id="mainComplaint"
                        value={anamnesis.mainComplaint || ''}
                        onChange={(e) => setAnamnesis({...anamnesis, mainComplaint: e.target.value})}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{anamnesis.mainComplaint || '-'}</p>
                    )}
                  </div>

                  {/* Questionário de Saúde */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Questionário de Saúde</h3>
                    <div className="space-y-6">
                      {/* Doenças */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="hasDisease"
                              checked={anamnesis.hasDisease || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, hasDisease: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.hasDisease ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.hasDisease && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="hasDisease">Sofre alguma doença?</Label>
                        </div>
                        {anamnesis.hasDisease && (
                          <div className="ml-6">
                            <Label htmlFor="diseaseDescription">Se sim, qual?</Label>
                            {editingAnamnesis ? (
                              <Input
                                id="diseaseDescription"
                                value={anamnesis.diseaseDescription || ''}
                                onChange={(e) => setAnamnesis({...anamnesis, diseaseDescription: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{anamnesis.diseaseDescription || '-'}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tratamento Odontológico */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Tratamento Odontológico</h4>
                        <div>
                          <Label htmlFor="lastDentalTreatment">Última vez que esteve em tratamento odontológico?</Label>
                          {editingAnamnesis ? (
                            <Input
                              id="lastDentalTreatment"
                              value={anamnesis.lastDentalTreatment || ''}
                              onChange={(e) => setAnamnesis({...anamnesis, lastDentalTreatment: e.target.value})}
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{anamnesis.lastDentalTreatment || '-'}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastDentalProcedure">Qual procedimento?</Label>
                          {editingAnamnesis ? (
                            <Input
                              id="lastDentalProcedure"
                              value={anamnesis.lastDentalProcedure || ''}
                              onChange={(e) => setAnamnesis({...anamnesis, lastDentalProcedure: e.target.value})}
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{anamnesis.lastDentalProcedure || '-'}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="hadDentalProblems"
                              checked={anamnesis.hadDentalProblems || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, hadDentalProblems: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.hadDentalProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.hadDentalProblems && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="hadDentalProblems">Houve problema?</Label>
                        </div>
                        {anamnesis.hadDentalProblems && (
                          <div className="ml-6">
                            <Label htmlFor="dentalProblemsDescription">Se sim, qual?</Label>
                            {editingAnamnesis ? (
                              <Input
                                id="dentalProblemsDescription"
                                value={anamnesis.dentalProblemsDescription || ''}
                                onChange={(e) => setAnamnesis({...anamnesis, dentalProblemsDescription: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{anamnesis.dentalProblemsDescription || '-'}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tratamento Médico */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Tratamento Médico</h4>
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="currentMedicalTreatment"
                              checked={anamnesis.currentMedicalTreatment || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, currentMedicalTreatment: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.currentMedicalTreatment ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.currentMedicalTreatment && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="currentMedicalTreatment">Está em tratamento médico atualmente?</Label>
                        </div>
                        {anamnesis.currentMedicalTreatment && (
                          <div className="ml-6 space-y-4">
                            <div>
                              <Label htmlFor="medicalTreatmentDescription">Se sim, qual?</Label>
                              {editingAnamnesis ? (
                                <Input
                                  id="medicalTreatmentDescription"
                                  value={anamnesis.medicalTreatmentDescription || ''}
                                  onChange={(e) => setAnamnesis({...anamnesis, medicalTreatmentDescription: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-gray-600 mt-1">{anamnesis.medicalTreatmentDescription || '-'}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="doctorName">Nome do médico assistente</Label>
                              {editingAnamnesis ? (
                                <Input
                                  id="doctorName"
                                  value={anamnesis.doctorName || ''}
                                  onChange={(e) => setAnamnesis({...anamnesis, doctorName: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-gray-600 mt-1">{anamnesis.doctorName || '-'}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="doctorPhone">Telefone do médico</Label>
                              {editingAnamnesis ? (
                                <Input
                                  id="doctorPhone"
                                  value={anamnesis.doctorPhone || ''}
                                  onChange={(e) => setAnamnesis({...anamnesis, doctorPhone: e.target.value})}
                                />
                              ) : (
                                <p className="text-sm text-gray-600 mt-1">{anamnesis.doctorPhone || '-'}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Gravidez */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Gravidez</h4>
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="isPregnant"
                              checked={anamnesis.isPregnant || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, isPregnant: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.isPregnant ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.isPregnant && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="isPregnant">Gravidez?</Label>
                        </div>
                        {anamnesis.isPregnant && (
                          <div className="ml-6">
                            <Label htmlFor="pregnancyTime">Se sim, quanto tempo?</Label>
                            {editingAnamnesis ? (
                              <Input
                                id="pregnancyTime"
                                value={anamnesis.pregnancyTime || ''}
                                onChange={(e) => setAnamnesis({...anamnesis, pregnancyTime: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{anamnesis.pregnancyTime || '-'}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Medicações */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Medicações</h4>
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="takingMedication"
                              checked={anamnesis.takingMedication || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, takingMedication: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.takingMedication ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.takingMedication && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="takingMedication">Está fazendo uso de alguma medicação?</Label>
                        </div>
                        {anamnesis.takingMedication && (
                          <div className="ml-6">
                            <Label htmlFor="medicationDescription">Se sim, qual?</Label>
                            {editingAnamnesis ? (
                              <Input
                                id="medicationDescription"
                                value={anamnesis.medicationDescription || ''}
                                onChange={(e) => setAnamnesis({...anamnesis, medicationDescription: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{anamnesis.medicationDescription || '-'}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Alergias */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Alergias</h4>
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="medicationAllergy"
                              checked={anamnesis.medicationAllergy || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, medicationAllergy: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.medicationAllergy ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.medicationAllergy && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="medicationAllergy">Tem alergia a medicamentos?</Label>
                        </div>
                        {anamnesis.medicationAllergy && (
                          <div className="ml-6">
                            <Label htmlFor="medicationAllergyDescription">Se sim, qual?</Label>
                            {editingAnamnesis ? (
                              <Input
                                id="medicationAllergyDescription"
                                value={anamnesis.medicationAllergyDescription || ''}
                                onChange={(e) => setAnamnesis({...anamnesis, medicationAllergyDescription: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{anamnesis.medicationAllergyDescription || '-'}</p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="hasAnyAllergy"
                              checked={anamnesis.hasAnyAllergy || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, hasAnyAllergy: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.hasAnyAllergy ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.hasAnyAllergy && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="hasAnyAllergy">Teve qualquer tipo de alergia?</Label>
                        </div>
                        {anamnesis.hasAnyAllergy && (
                          <div className="ml-6">
                            <Label htmlFor="allergyDescription">Se sim, qual?</Label>
                            {editingAnamnesis ? (
                              <Input
                                id="allergyDescription"
                                value={anamnesis.allergyDescription || ''}
                                onChange={(e) => setAnamnesis({...anamnesis, allergyDescription: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{anamnesis.allergyDescription || '-'}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Cirurgias */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Cirurgias</h4>
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="hadSurgery"
                              checked={anamnesis.hadSurgery || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, hadSurgery: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.hadSurgery ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.hadSurgery && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="hadSurgery">Já foi operado?</Label>
                        </div>
                        {anamnesis.hadSurgery && (
                          <div className="ml-6">
                            <Label htmlFor="surgeryDescription">Quais?</Label>
                            {editingAnamnesis ? (
                              <Input
                                id="surgeryDescription"
                                value={anamnesis.surgeryDescription || ''}
                                onChange={(e) => setAnamnesis({...anamnesis, surgeryDescription: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{anamnesis.surgeryDescription || '-'}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Problemas Médicos */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Problemas Médicos</h4>
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="healingProblems"
                              checked={anamnesis.healingProblems || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, healingProblems: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.healingProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.healingProblems && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="healingProblems">Teve problema com cicatrização?</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="anesthesiaProblems"
                              checked={anamnesis.anesthesiaProblems || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, anesthesiaProblems: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.anesthesiaProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.anesthesiaProblems && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="anesthesiaProblems">Teve problema com anestesia?</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="hemorrhageProblems"
                              checked={anamnesis.hemorrhageProblems || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, hemorrhageProblems: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.hemorrhageProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.hemorrhageProblems && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="hemorrhageProblems">Teve problemas de hemorragia?</Label>
                        </div>
                      </div>

                      {/* Doenças Específicas */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Sofre alguma das seguintes doenças?</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="rheumaticFever"
                                checked={anamnesis.rheumaticFever || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, rheumaticFever: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.rheumaticFever ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.rheumaticFever && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="rheumaticFever">Febre Reumática</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="heartProblems"
                                checked={anamnesis.heartProblems || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, heartProblems: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.heartProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.heartProblems && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="heartProblems">Problemas Cardíacos</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="respiratoryProblems"
                                checked={anamnesis.respiratoryProblems || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, respiratoryProblems: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.respiratoryProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.respiratoryProblems && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="respiratoryProblems">Problemas Respiratórios</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="allergicProblems"
                                checked={anamnesis.allergicProblems || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, allergicProblems: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.allergicProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.allergicProblems && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="allergicProblems">Problemas Alérgicos</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="kidneyProblems"
                                checked={anamnesis.kidneyProblems || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, kidneyProblems: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.kidneyProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.kidneyProblems && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="kidneyProblems">Problemas Renais</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="jointProblems"
                                checked={anamnesis.jointProblems || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, jointProblems: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.jointProblems ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.jointProblems && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="jointProblems">Problemas Articulares</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="diabetesType1"
                                checked={anamnesis.diabetesType1 || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, diabetesType1: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.diabetesType1 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.diabetesType1 && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="diabetesType1">Diabetes Tipo 1</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="diabetesType2"
                                checked={anamnesis.diabetesType2 || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, diabetesType2: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.diabetesType2 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.diabetesType2 && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="diabetesType2">Diabetes Tipo 2</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="hypertension"
                                checked={anamnesis.hypertension || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, hypertension: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.hypertension ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.hypertension && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="hypertension">Hipertensão Arterial</Label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="otherDiseases">Possui alguma doença/problema não mencionado?</Label>
                          {editingAnamnesis ? (
                            <Input
                              id="otherDiseases"
                              value={anamnesis.otherDiseases || ''}
                              onChange={(e) => setAnamnesis({...anamnesis, otherDiseases: e.target.value})}
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{anamnesis.otherDiseases || '-'}</p>
                          )}
                        </div>
                      </div>

                      {/* Hábitos */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Hábitos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="bitesNails"
                                checked={anamnesis.bitesNails || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, bitesNails: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.bitesNails ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.bitesNails && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="bitesNails">Roer Unha</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="mouthBreathing"
                                checked={anamnesis.mouthBreathing || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, mouthBreathing: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.mouthBreathing ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.mouthBreathing && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="mouthBreathing">Respirar pela Boca</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            {editingAnamnesis ? (
                              <Checkbox
                                id="teethGrinding"
                                checked={anamnesis.teethGrinding || false}
                                onCheckedChange={(checked) => setAnamnesis({...anamnesis, teethGrinding: checked as boolean})}
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded border ${anamnesis.teethGrinding ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {anamnesis.teethGrinding && <Check className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            <Label htmlFor="teethGrinding">Ranger os Dentes</Label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="otherHabits">Outros hábitos</Label>
                          {editingAnamnesis ? (
                            <Input
                              id="otherHabits"
                              value={anamnesis.otherHabits || ''}
                              onChange={(e) => setAnamnesis({...anamnesis, otherHabits: e.target.value})}
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">{anamnesis.otherHabits || '-'}</p>
                          )}
                        </div>
                      </div>

                      {/* Tabagismo */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Tabagismo</h4>
                        <div className="flex items-center space-x-2">
                          {editingAnamnesis ? (
                            <Checkbox
                              id="isSmoker"
                              checked={anamnesis.isSmoker || false}
                              onCheckedChange={(checked) => setAnamnesis({...anamnesis, isSmoker: checked as boolean})}
                            />
                          ) : (
                            <div className={`w-4 h-4 rounded border ${anamnesis.isSmoker ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {anamnesis.isSmoker && <Check className="h-3 w-3 text-white" />}
                            </div>
                          )}
                          <Label htmlFor="isSmoker">Fumante?</Label>
                        </div>
                        {anamnesis.isSmoker && (
                          <div className="ml-6">
                            <Label htmlFor="smokingDuration">Se sim, há quanto tempo?</Label>
                            {editingAnamnesis ? (
                              <Input
                                id="smokingDuration"
                                value={anamnesis.smokingDuration || ''}
                                onChange={(e) => setAnamnesis({...anamnesis, smokingDuration: e.target.value})}
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{anamnesis.smokingDuration || '-'}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <Label htmlFor="importantObservations">Outras Observações Importantes</Label>
                    {editingAnamnesis ? (
                      <Textarea
                        id="importantObservations"
                        value={anamnesis.importantObservations || ''}
                        onChange={(e) => setAnamnesis({...anamnesis, importantObservations: e.target.value})}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{anamnesis.importantObservations || '-'}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dental-chart" className="space-y-4">
          <DentalChart 
            doctorPatientId={doctorPatientId}
            patientName={patientName}
            mode="view"
          />
        </TabsContent>

        <TabsContent value="patient-link" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LinkIcon className="h-5 w-5" />
                <span>Link para Preenchimento pelo Paciente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Gere um link único para que o paciente possa preencher suas próprias fichas clínicas e de anamnese.
              </p>

              {!patientFormToken ? (
                <div className="text-center py-8">
                  <LinkIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum link gerado ainda</p>
                  <Button onClick={generatePatientFormLink} disabled={saving}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {saving ? 'Gerando...' : 'Gerar Link'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Link do Paciente</Label>
                      <Badge
                        variant={patientFormToken.used ? "outline" : patientFormToken.expired ? "destructive" : "default"}
                      >
                        {patientFormToken.used ? 'Usado' : patientFormToken.expired ? 'Expirado' : 'Ativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={patientFormToken.url}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(patientFormToken.url)}
                      >
                        {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Expira em: {new Date(patientFormToken.expiresAt).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={generatePatientFormLink}
                      disabled={saving}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {saving ? 'Gerando...' : 'Gerar Novo Link'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
