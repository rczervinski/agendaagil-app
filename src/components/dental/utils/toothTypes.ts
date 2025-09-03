export interface ToothRecord {
  id: string
  doctorPatientId: string
  appointmentId?: string
  procedureId?: string
  toothNumberSite: number
  toothNumberFDI: string
  treatmentType: string
  notes?: string
  status: ToothStatus
  createdAt: Date
  updatedAt: Date
  
  // Relações populadas (opcional)
  appointment?: {
    id: string
    date: Date
    type: string
    notes?: string
  }
  procedure?: {
    id: string
    name: string
    description?: string
    duration: number
  }
}

export enum ToothStatus {
  ACTIVE = "ACTIVE",
  EXTRACTED = "EXTRACTED", 
  TREATED = "TREATED",
  PENDING = "PENDING"
}

export enum NumberingSystem {
  UNIVERSAL = "UNIVERSAL", // 1-32
  FDI = "FDI"             // 11, 12, 13, etc.
}

export interface DentalChartProps {
  doctorPatientId: string
  patientName?: string
  mode?: 'view' | 'select'
  selectedTeeth?: number[]
  onTeethSelect?: (teeth: number[]) => void
  onToothClick?: (toothNumber: number) => void
  numberingSystem?: NumberingSystem
  showLabels?: boolean
  readOnly?: boolean
}

export interface ToothComponentProps {
  toothNumber: number
  numberingSystem: NumberingSystem
  hasHistory: boolean
  isSelected: boolean
  onClick: (toothNumber: number) => void
  showLabel?: boolean
  disabled?: boolean
}

export interface ToothHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  toothNumber: number
  toothRecords: ToothRecord[]
  patientName: string
}

export interface TeethSelectorProps {
  selectedTeeth: number[]
  onSelectionChange: (teeth: number[]) => void
  numberingSystem?: NumberingSystem
  maxSelection?: number
}

// Tipo para o form de criação de procedimento em dente
export interface ToothProcedureForm {
  toothNumbers: number[]
  procedureId?: string
  treatmentType: string
  notes?: string
  appointmentId?: string
}

// Response da API para buscar histórico dental
export interface DentalChartResponse {
  doctorPatientId: string
  patientName: string
  teeth: ToothRecord[]
  totalProcedures: number
  lastUpdate?: Date
}

// Estatísticas da arca dentária
export interface DentalStats {
  totalTeeth: number
  treatedTeeth: number
  extractedTeeth: number
  pendingTreatments: number
  lastProcedureDate?: Date
}