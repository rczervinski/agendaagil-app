'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DentalChart } from './DentalChart'
import { TeethSelectorProps, NumberingSystem } from './utils/toothTypes'
import { getToothName, universalToFDI } from './utils/toothMapping'
import { ToothProcedureModal } from './ToothProcedureModal'
import { Settings, RotateCcw, Info, Edit3 } from 'lucide-react'

interface ExtendedTeethSelectorProps extends TeethSelectorProps {
  procedures?: Array<{
    id: string
    name: string
    duration: number
    description?: string
  }>
  onTeethProceduresChange?: (procedures: any[]) => void
}

export function TeethSelector({
  selectedTeeth,
  onSelectionChange,
  numberingSystem = NumberingSystem.FDI,
  maxSelection,
  procedures = [],
  onTeethProceduresChange
}: ExtendedTeethSelectorProps) {
  const [currentNumberingSystem, setCurrentNumberingSystem] = useState(numberingSystem)
  const [showProcedureModal, setShowProcedureModal] = useState(false)
  
  const handleToothSelection = (teeth: number[]) => {
    // Respeitar limite máximo se especificado
    if (maxSelection && teeth.length > maxSelection) {
      // Remover os dentes mais antigos se exceder o limite
      const limitedTeeth = teeth.slice(-maxSelection)
      onSelectionChange(limitedTeeth)
    } else {
      onSelectionChange(teeth)
    }
  }
  
  const clearSelection = () => {
    onSelectionChange([])
  }
  
  const toggleNumberingSystem = () => {
    setCurrentNumberingSystem(
      currentNumberingSystem === NumberingSystem.UNIVERSAL 
        ? NumberingSystem.FDI 
        : NumberingSystem.UNIVERSAL
    )
  }

  const handleSaveTeethProcedures = (procedures: any[]) => {
    onTeethProceduresChange?.(procedures)
  }
  
  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🦷 Arca Dentária
            {selectedTeeth.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedTeeth.length} selecionado{selectedTeeth.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedTeeth.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleNumberingSystem}
              className="flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              {currentNumberingSystem === NumberingSystem.FDI ? 'FDI' : 'Universal'}
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>Clique nos dentes para selecioná-los. Configure os procedimentos específicos após a seleção.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dental Chart em modo seleção */}
        <DentalChart
          doctorPatientId="" // Não precisa de ID para seleção apenas
          mode="select"
          selectedTeeth={selectedTeeth}
          onTeethSelect={handleToothSelection}
          numberingSystem={currentNumberingSystem}
          showLabels={true}
          readOnly={false}
        />
        
        {/* Lista dos dentes selecionados */}
        {selectedTeeth.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Dentes Selecionados ({selectedTeeth.length})
              </h4>
              {procedures.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProcedureModal(true)}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  Configurar Procedimentos
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTeeth.map(toothNumber => {
                const displayNumber = currentNumberingSystem === NumberingSystem.FDI 
                  ? universalToFDI(toothNumber) 
                  : toothNumber.toString()
                const toothName = getToothName(toothNumber)
                
                return (
                  <Badge 
                    key={toothNumber} 
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-red-100"
                    onClick={() => {
                      const newSelection = selectedTeeth.filter(t => t !== toothNumber)
                      onSelectionChange(newSelection)
                    }}
                    title={`${toothName} - Clique para remover`}
                  >
                    {displayNumber}
                    <span className="text-xs text-gray-500">×</span>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Mensagem quando nenhum dente está selecionado */}
        {selectedTeeth.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🦷</div>
            <p className="text-sm">Nenhum dente selecionado</p>
            <p className="text-xs mt-1">Clique nos dentes acima para selecioná-los</p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Modal de gerenciamento de procedimentos */}
    <ToothProcedureModal
      isOpen={showProcedureModal}
      onClose={() => setShowProcedureModal(false)}
      selectedTeeth={selectedTeeth}
      onSaveTeethProcedures={handleSaveTeethProcedures}
      procedures={procedures}
      numberingSystem={currentNumberingSystem}
    />
  </>
  )
}