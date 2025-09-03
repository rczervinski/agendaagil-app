'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Plus, Trash2, Edit3 } from "lucide-react"
import { getToothName, universalToFDI } from './utils/toothMapping'
import { NumberingSystem } from './utils/toothTypes'

interface ToothProcedure {
  id: string
  toothNumber: number
  toothNumberFDI?: string
  procedureId?: string
  procedureName: string
  notes?: string
  duration?: number
}

interface ToothProcedureModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTeeth: number[]
  onSaveTeethProcedures: (procedures: ToothProcedure[]) => void
  procedures: Array<{
    id: string
    name: string
    duration: number
    description?: string
  }>
  numberingSystem?: NumberingSystem
}

export function ToothProcedureModal({
  isOpen,
  onClose,
  selectedTeeth,
  onSaveTeethProcedures,
  procedures,
  numberingSystem = NumberingSystem.UNIVERSAL
}: ToothProcedureModalProps) {
  const [teethProcedures, setTeethProcedures] = useState<ToothProcedure[]>([])
  const [editingTooth, setEditingTooth] = useState<number | null>(null)

  // Inicializar procedimentos para cada dente selecionado
  useEffect(() => {
    if (isOpen && selectedTeeth.length > 0) {
      const initialProcedures = selectedTeeth.map(toothNumber => ({
        id: `temp-${toothNumber}`,
        toothNumber,
        procedureId: procedures[0]?.id || '',
        procedureName: procedures[0]?.name || 'Consulta',
        notes: '',
        duration: procedures[0]?.duration || 30
      }))
      setTeethProcedures(initialProcedures)
    }
  }, [isOpen, selectedTeeth, procedures])

  const updateToothProcedure = (toothNumber: number, updates: Partial<ToothProcedure>) => {
    setTeethProcedures(prev => 
      prev.map(tp => 
        tp.toothNumber === toothNumber 
          ? { ...tp, ...updates }
          : tp
      )
    )
  }

  const addProcedureToTooth = (toothNumber: number) => {
    const newProcedure: ToothProcedure = {
      id: `temp-${toothNumber}-${Date.now()}`,
      toothNumber,
      procedureId: procedures[0]?.id || '',
      procedureName: procedures[0]?.name || 'Consulta',
      notes: '',
      duration: procedures[0]?.duration || 30
    }
    setTeethProcedures(prev => [...prev, newProcedure])
  }

  const removeProcedureFromTooth = (procedureId: string) => {
    setTeethProcedures(prev => prev.filter(tp => tp.id !== procedureId))
  }

  const getToothProcedures = (toothNumber: number) => {
    return teethProcedures.filter(tp => tp.toothNumber === toothNumber)
  }

  const handleSave = () => {
    // Adicionar ambas as numerações para cada procedimento
    const proceduresWithBothNumbering = teethProcedures.map(proc => ({
      ...proc,
      toothNumberFDI: universalToFDI(proc.toothNumber)
    }))
    
    onSaveTeethProcedures(proceduresWithBothNumbering)
    onClose()
  }

  const getToothDisplayNumber = (toothNumber: number) => {
    return numberingSystem === NumberingSystem.FDI 
      ? universalToFDI(toothNumber) 
      : toothNumber.toString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🦷 Gerenciar Procedimentos por Dente
              <Badge variant="outline">{selectedTeeth.length} dentes selecionados</Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Configure procedimentos específicos para cada dente selecionado. Você pode ter múltiplos procedimentos por dente e salvar como planejamento para consultas futuras.
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-6">
          {selectedTeeth.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🦷</div>
              <h3 className="text-lg font-medium mb-2">Nenhum dente selecionado</h3>
              <p className="text-sm">
                Primeiro selecione os dentes na arca dentária para configurar os procedimentos
              </p>
            </div>
          ) : (
            selectedTeeth.map(toothNumber => {
              const toothProcedures = getToothProcedures(toothNumber)
              const displayNumber = getToothDisplayNumber(toothNumber)
              const toothName = getToothName(toothNumber)

              return (
                <Card key={toothNumber} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-700">{displayNumber}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{toothName}</h3>
                        <p className="text-sm text-gray-600">Dente {displayNumber}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addProcedureToTooth(toothNumber)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Procedimento
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {toothProcedures.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">Nenhum procedimento configurado</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addProcedureToTooth(toothNumber)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar primeiro procedimento
                      </Button>
                    </div>
                  ) : (
                    toothProcedures.map((toothProc, index) => (
                      <div key={toothProc.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Procedimento {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProcedureFromTooth(toothProc.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Procedimento</Label>
                            <select
                              value={toothProc.procedureId}
                              onChange={(e) => {
                                const selectedProc = procedures.find(p => p.id === e.target.value)
                                updateToothProcedure(toothNumber, {
                                  procedureId: e.target.value,
                                  procedureName: selectedProc?.name || '',
                                  duration: selectedProc?.duration || 30
                                })
                              }}
                              className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                            >
                              {procedures.map(proc => (
                                <option key={proc.id} value={proc.id}>
                                  {proc.name} ({proc.duration}min)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-gray-600">Observações</Label>
                            <Input
                              value={toothProc.notes || ''}
                              onChange={(e) => updateToothProcedure(toothNumber, { notes: e.target.value })}
                              placeholder="Observações específicas..."
                              className="mt-1 text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="secondary" className="text-xs">
                            Duração: {toothProc.duration}min
                          </Badge>
                          {toothProc.notes && (
                            <Badge variant="outline" className="text-xs">
                              Com observações
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                </Card>
              )
            })
          )}
        </CardContent>

        <Separator />
        
        {/* Footer fixo com botões de ação */}
        <div className="p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total de procedimentos: {teethProcedures.length}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Procedimentos
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}