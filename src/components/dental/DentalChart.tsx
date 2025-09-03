'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ToothComponent } from './ToothComponent'
import { ToothHistoryModal } from './ToothHistoryModal'
import { DentalChartProps, NumberingSystem, ToothRecord } from './utils/toothTypes'
import { universalToFDI } from './utils/toothMapping'
import { Settings, RotateCcw } from 'lucide-react'

export function DentalChart({
  doctorPatientId,
  patientName,
  mode = 'view',
  selectedTeeth = [],
  onTeethSelect,
  onToothClick,
  numberingSystem = NumberingSystem.FDI,
  showLabels = true,
  readOnly = false
}: DentalChartProps) {
  const [currentNumberingSystem, setCurrentNumberingSystem] = useState(numberingSystem)
  const [teethRecords, setTeethRecords] = useState<ToothRecord[]>([])
  const [selectedToothNumber, setSelectedToothNumber] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [internalSelectedTeeth, setInternalSelectedTeeth] = useState<number[]>(selectedTeeth)
  
  const fetchTeethData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/doctor-patients/${doctorPatientId}/dental-chart`)
      if (response.ok) {
        const data = await response.json()
        setTeethRecords(data.teeth || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados dentários:', error)
    } finally {
      setLoading(false)
    }
  }, [doctorPatientId])
  
  // Carregar dados dos dentes
  useEffect(() => {
    fetchTeethData()
  }, [fetchTeethData])
  
  // Sincronizar seleção externa
  useEffect(() => {
    if (JSON.stringify(selectedTeeth) !== JSON.stringify(internalSelectedTeeth)) {
      setInternalSelectedTeeth(selectedTeeth)
    }
  }, [selectedTeeth]) // Remove internalSelectedTeeth das dependências para evitar loop
  
  const handleToothClick = useCallback((toothNumber: number) => {
    if (mode === 'select' && !readOnly) {
      // Modo seleção para agendamento
      const currentSelection = internalSelectedTeeth
      const newSelection = currentSelection.includes(toothNumber)
        ? currentSelection.filter(t => t !== toothNumber)
        : [...currentSelection, toothNumber]
      
      setInternalSelectedTeeth(newSelection)
      
      // Usar setTimeout para chamar onTeethSelect após o render
      setTimeout(() => {
        onTeethSelect?.(newSelection)
      }, 0)
    } else {
      // Modo visualização - abrir modal de histórico
      setSelectedToothNumber(toothNumber)
      setIsModalOpen(true)
      onToothClick?.(toothNumber)
    }
  }, [mode, readOnly, onTeethSelect, onToothClick, internalSelectedTeeth])
  
  const getToothRecords = (toothNumber: number): ToothRecord[] => {
    return teethRecords.filter(record => record.toothNumberSite === toothNumber)
  }
  
  const hasToothHistory = (toothNumber: number): boolean => {
    return getToothRecords(toothNumber).length > 0
  }
  
  const clearSelection = () => {
    setInternalSelectedTeeth([])
    onTeethSelect?.([])
  }
  
  const toggleNumberingSystem = () => {
    setCurrentNumberingSystem(
      currentNumberingSystem === NumberingSystem.UNIVERSAL 
        ? NumberingSystem.FDI 
        : NumberingSystem.UNIVERSAL
    )
  }
  
  // Organizar dentes seguindo numeração anatômica (como na imagem de referência)
  const upperTeeth = Array.from({length: 16}, (_, i) => i + 1)    // 1-16 (direita para esquerda)
  const lowerTeeth = Array.from({length: 16}, (_, i) => i + 17)   // 17-32 (esquerda para direita)
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🦷 Arca Dentária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🦷 Arca Dentária
              {mode === 'select' && (
                <Badge variant="outline" className="ml-2">
                  Modo Seleção
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {mode === 'select' && internalSelectedTeeth.length > 0 && (
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={clearSelection}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpar ({internalSelectedTeeth.length})
                </Button>
              )}
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleNumberingSystem}
                  className="flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  {currentNumberingSystem === NumberingSystem.FDI ? 'FDI (Padrão)' : 'Universal (1-32)'}
                </Button>
              )}
            </div>
          </div>
          {mode === 'select' && (
            <p className="text-sm text-gray-600">
              Clique nos dentes para selecionar onde o procedimento será realizado
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-8">
          {/* Arca Dentária Superior com curvatura */}
          <div className="flex justify-center">
            <div className="flex items-end gap-1 sm:gap-2 lg:gap-3" style={{
              transform: 'perspective(600px) rotateX(8deg)',
              transformOrigin: 'center'
            }}>
              {upperTeeth.map(toothNumber => {
                // Calcular posição na curva (0 = centro, valores negativos = direita, positivos = esquerda)
                const position = toothNumber - 8.5
                const absPosition = Math.abs(position)
                
                // Ajustar tamanho baseado na anatomia real (incisivos da frente são maiores e mais compridos)
                let scale = 1
                if (absPosition <= 1.5) scale = 1.3      // Incisivos centrais e laterais - maiores e mais compridos
                else if (absPosition <= 2.5) scale = 1.1 // Caninos - médios-grandes
                else if (absPosition <= 4.5) scale = 0.9 // Pré-molares - médios
                else scale = 1.0                         // Molares - tamanho base
                
                // Rotação para criar a curva da boca
                const rotation = position * 3
                
                return (
                  <div 
                    key={`upper-tooth-${toothNumber}`}
                    className="flex flex-col items-center"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${scale})`,
                      transformOrigin: 'center bottom'
                    }}
                  >
                    {/* Numeração acima do dente */}
                    <div className="text-xs font-medium text-gray-700 mb-1 text-center">
                      {currentNumberingSystem === NumberingSystem.FDI 
                        ? universalToFDI(toothNumber) 
                        : toothNumber.toString()}
                    </div>
                    <ToothComponent
                      toothNumber={toothNumber}
                      numberingSystem={currentNumberingSystem}
                      hasHistory={hasToothHistory(toothNumber)}
                      isSelected={internalSelectedTeeth.includes(toothNumber)}
                      onClick={handleToothClick}
                      showLabel={false}
                      disabled={readOnly && mode === 'select'}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Separador central mais sutil */}
          <div className="flex justify-center">
            <div className="w-32 h-px bg-gray-200"></div>
          </div>
          
          {/* Arca Dentária Inferior com curvatura */}
          <div className="flex justify-center">
            <div className="flex items-start gap-1 sm:gap-2 lg:gap-3" style={{
              transform: 'perspective(600px) rotateX(-8deg)',
              transformOrigin: 'center'
            }}>
              {lowerTeeth.map(toothNumber => {
                // Calcular posição na curva (inversa para a arcada inferior)
                const position = 24.5 - toothNumber
                const absPosition = Math.abs(position)
                
                // Ajustar tamanho baseado na anatomia real (mesmo padrão da superior)
                let scale = 1
                if (absPosition <= 1.5) scale = 1.3      // Incisivos centrais e laterais - maiores e mais compridos
                else if (absPosition <= 2.5) scale = 1.1 // Caninos - médios-grandes  
                else if (absPosition <= 4.5) scale = 0.9 // Pré-molares - médios
                else scale = 1.0                         // Molares - tamanho base
                
                // Rotação para criar a curva da boca
                const rotation = position * 3
                
                return (
                  <div 
                    key={`lower-tooth-${toothNumber}`}
                    className="flex flex-col items-center"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${scale})`,
                      transformOrigin: 'center top'
                    }}
                  >
                    <ToothComponent
                      toothNumber={toothNumber}
                      numberingSystem={currentNumberingSystem}
                      hasHistory={hasToothHistory(toothNumber)}
                      isSelected={internalSelectedTeeth.includes(toothNumber)}
                      onClick={handleToothClick}
                      showLabel={false}
                      disabled={readOnly && mode === 'select'}
                    />
                    {/* Numeração abaixo do dente */}
                    <div className="text-xs font-medium text-gray-700 mt-1 text-center">
                      {currentNumberingSystem === NumberingSystem.FDI 
                        ? universalToFDI(toothNumber) 
                        : toothNumber.toString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Legenda */}
          <div className="flex justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Com histórico</span>
            </div>
            {mode === 'select' && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Selecionado</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de histórico do dente */}
      {selectedToothNumber && (
        <ToothHistoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedToothNumber(null)
          }}
          toothNumber={selectedToothNumber}
          toothRecords={getToothRecords(selectedToothNumber)}
          patientName={patientName || "Paciente"}
        />
      )}
    </>
  )
}