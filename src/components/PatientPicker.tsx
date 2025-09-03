'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  User, 
  Phone, 
  Calendar,
  X,
  Check,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react'

interface Patient {
  id: string
  doctorPatientId: string
  name: string
  phone: string
  email?: string
  birthDate?: string
  gender?: string
  appointmentCount: number
  status: string
  needsConsent?: boolean
  privacyLevel?: string
  hasFullAccess?: boolean
}

interface PatientPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelectPatient: (patient: Patient) => void
  doctorId: string
  tenantId: string
}

export function PatientPicker({ 
  isOpen, 
  onClose, 
  onSelectPatient, 
  doctorId, 
  tenantId 
}: PatientPickerProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadPatients()
    }
  }, [isOpen, doctorId, tenantId])

  useEffect(() => {
    // Filter patients based on search term
    if (searchTerm.trim()) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])

  const loadPatients = async () => {
    if (!doctorId || doctorId === 'loading' || !tenantId || tenantId === 'loading') {
      console.log('Skipping patient load in picker - IDs not ready:', { doctorId, tenantId })
      return
    }
    
    try {
      setLoading(true)
      console.log('Loading patients in picker with IDs:', { doctorId, tenantId })
      const response = await fetch(`/api/patients?doctorId=${doctorId}&tenantId=${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
        setFilteredPatients(data)
        console.log('Loaded patients in picker:', data.length)
      } else {
        console.error('Failed to load patients:', await response.text())
      }
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A'
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient)
    onClose()
    setSearchTerm('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Selecionar Paciente</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                  </p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      patient.needsConsent 
                        ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        patient.needsConsent ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <span className={`text-sm font-medium ${
                          patient.needsConsent ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{patient.name}</h3>
                          {patient.needsConsent && (
                            <div className="flex items-center space-x-1">
                              <Shield className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs text-yellow-600 font-medium">LGPD</span>
                            </div>
                          )}
                          {patient.privacyLevel === 'MINIMAL' && (
                            <EyeOff className="h-3 w-3 text-gray-400" title="Dados limitados" />
                          )}
                          {patient.hasFullAccess && (
                            <Eye className="h-3 w-3 text-green-600" title="Acesso completo" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{patient.phone}</span>
                          </div>
                          {!patient.needsConsent && (
                            <>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{calculateAge(patient.birthDate)} anos</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{patient.appointmentCount} consultas</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {patient.needsConsent && (
                          <div className="mt-1">
                            <p className="text-xs text-yellow-700">
                              ⚠️ Dados limitados - Consentimento necessário para acesso completo
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {patient.needsConsent ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Privado
                        </Badge>
                      ) : (
                        <Badge className={patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}