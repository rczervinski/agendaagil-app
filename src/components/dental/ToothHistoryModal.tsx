'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ToothHistoryModalProps, NumberingSystem } from './utils/toothTypes'
import { universalToFDI, getToothName } from './utils/toothMapping'
import { Calendar, FileText, User, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ToothHistoryModal({
  isOpen,
  onClose,
  toothNumber,
  toothRecords,
  patientName
}: ToothHistoryModalProps) {
  const toothName = getToothName(toothNumber)
  const fdiNumber = universalToFDI(toothNumber)
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'EXTRACTED': return 'bg-red-100 text-red-800'
      case 'TREATED': return 'bg-blue-100 text-blue-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo'
      case 'EXTRACTED': return 'Extraído'
      case 'TREATED': return 'Tratado'
      case 'PENDING': return 'Pendente'
      default: return status
    }
  }
  
  const sortedRecords = [...toothRecords].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  const currentStatus = sortedRecords[0]?.status || 'ACTIVE'
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🦷</span>
            Histórico do Dente {toothNumber}
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span><strong>Paciente:</strong> {patientName}</span>
                <span><strong>Numeração FDI:</strong> {fdiNumber}</span>
                <Badge className={getStatusColor(currentStatus)}>
                  {getStatusLabel(currentStatus)}
                </Badge>
              </div>
              <p className="text-gray-600">{toothName}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {sortedRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum procedimento registrado para este dente.</p>
              <p className="text-sm mt-1">O histórico aparecerá aqui quando procedimentos forem realizados.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {sortedRecords.map((record, index) => (
                  <div key={record.id} className="relative">
                    {/* Timeline connector */}
                    {index < sortedRecords.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-200 -z-10" />
                    )}
                    
                    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{record.treatmentType}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(record.createdAt)}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(record.status)}>
                              {getStatusLabel(record.status)}
                            </Badge>
                          </div>
                          
                          {/* Detalhes do procedimento */}
                          {record.procedure && (
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <FileText className="w-4 h-4" />
                                Procedimento
                              </div>
                              <p className="text-sm text-gray-600">{record.procedure.name}</p>
                              {record.procedure.description && (
                                <p className="text-xs text-gray-500 mt-1">{record.procedure.description}</p>
                              )}
                              {record.procedure.duration && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{record.procedure.duration} min</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Consulta associada */}
                          {record.appointment && (
                            <div className="bg-blue-50 rounded-md p-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
                                <User className="w-4 h-4" />
                                Consulta
                              </div>
                              <div className="text-sm text-blue-600">
                                <p>{format(new Date(record.appointment.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                <p className="text-xs mt-1">{record.appointment.type}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Observações */}
                          {record.notes && (
                            <div className="bg-yellow-50 rounded-md p-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 mb-1">
                                <FileText className="w-4 h-4" />
                                Observações
                              </div>
                              <p className="text-sm text-yellow-700">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {index < sortedRecords.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          {/* Estatísticas rápidas */}
          {sortedRecords.length > 0 && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{sortedRecords.length}</p>
                  <p className="text-xs text-gray-600">Procedimentos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {format(new Date(sortedRecords[sortedRecords.length - 1].createdAt), "dd/MM", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-gray-600">Primeiro</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {format(new Date(sortedRecords[0].createdAt), "dd/MM", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-gray-600">Último</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}