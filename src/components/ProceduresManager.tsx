'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  FileText,
  X,
  Save
} from 'lucide-react'
import { APPOINTMENT_TYPES } from '@/lib/timeSlots'

interface Procedure {
  id: string
  name: string
  description?: string
  duration: number
  price?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProceduresManagerProps {
  tenantId: string
  onProcedureSelect?: (procedure: Procedure) => void
  onProcedureChange?: () => void
}

export function ProceduresManager({ tenantId, onProcedureSelect, onProcedureChange }: ProceduresManagerProps) {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProcedure, setEditingProcedure] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: ''
  })

  useEffect(() => {
    loadProcedures()
  }, [tenantId])

  const createDefaultProcedures = async () => {
    try {
      const promises = APPOINTMENT_TYPES.map(async (appointmentType) => {
        try {
          const response = await fetch('/api/procedures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: appointmentType.label,
              description: `Procedimento de ${appointmentType.label.toLowerCase()}`,
              duration: appointmentType.duration,
              tenantId
            })
          })
          
          if (!response.ok && response.status !== 409) {
            console.error(`Failed to create procedure ${appointmentType.label}:`, await response.text())
          }
        } catch (error) {
          console.error(`Error creating procedure ${appointmentType.label}:`, error)
        }
      })
      
      await Promise.all(promises)
      await loadProcedures() // Reload after creating defaults
    } catch (error) {
      console.error('Error creating default procedures:', error)
    }
  }

  const loadProcedures = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/procedures?tenantId=${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setProcedures(data)
        
        // If no procedures exist, create default ones
        if (data.length === 0) {
          await createDefaultProcedures()
        }
      } else {
        console.error('Failed to load procedures:', await response.text())
      }
    } catch (error) {
      console.error('Error loading procedures:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.duration) {
      alert('Nome e duração são obrigatórios')
      return
    }

    if (formData.duration % 15 !== 0) {
      alert('A duração deve ser múltiplo de 15 minutos')
      return
    }

    try {
      const url = editingProcedure ? `/api/procedures/${editingProcedure}` : '/api/procedures'
      const method = editingProcedure ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tenantId,
          price: formData.price ? parseFloat(formData.price) : null
        })
      })

      if (response.ok) {
        await loadProcedures()
        resetForm()
        setShowAddForm(false)
        setEditingProcedure(null)
        onProcedureChange?.() // Notify parent component
      } else {
        const error = await response.text()
        alert(`Erro: ${error}`)
      }
    } catch (error) {
      console.error('Error saving procedure:', error)
      alert('Erro ao salvar procedimento')
    }
  }

  const handleEdit = (procedure: Procedure) => {
    setFormData({
      name: procedure.name,
      description: procedure.description || '',
      duration: procedure.duration,
      price: procedure.price ? procedure.price.toString() : ''
    })
    setEditingProcedure(procedure.id)
    setShowAddForm(true)
  }

  const handleDelete = async (procedure: Procedure) => {
    if (!confirm(`Tem certeza que deseja excluir o procedimento "${procedure.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/procedures/${procedure.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadProcedures()
        onProcedureChange?.() // Notify parent component
      } else {
        alert('Erro ao excluir procedimento')
      }
    } catch (error) {
      console.error('Error deleting procedure:', error)
      alert('Erro ao excluir procedimento')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: ''
    })
  }

  const cancelEdit = () => {
    resetForm()
    setShowAddForm(false)
    setEditingProcedure(null)
  }

  const formatPrice = (price?: number) => {
    return price ? `R$ ${price.toFixed(2)}` : 'Não definido'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Procedimentos</h2>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Procedimento
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Procedimento *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Consulta, Limpeza, Restauração"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <select
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={75}>1 hora e 15 minutos</option>
                    <option value={90}>1 hora e 30 minutos</option>
                    <option value={105}>1 hora e 45 minutos</option>
                    <option value={120}>2 horas</option>
                    <option value={135}>2 horas e 15 minutos</option>
                    <option value={150}>2 horas e 30 minutos</option>
                    <option value={180}>3 horas</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Duração deve ser múltiplo de 15 minutos para manter o padrão do calendário
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="price">Preço (opcional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do procedimento"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingProcedure ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Procedures List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {procedures.map((procedure) => (
          <Card key={procedure.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{procedure.name}</h3>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(procedure)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(procedure)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              {procedure.description && (
                <p className="text-gray-600 text-sm mb-3">{procedure.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{procedure.duration} minutos</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{formatPrice(procedure.price)}</span>
                </div>
              </div>
              
              {onProcedureSelect && (
                <Button
                  className="w-full mt-3"
                  variant="outline"
                  size="sm"
                  onClick={() => onProcedureSelect(procedure)}
                >
                  Selecionar Procedimento
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {procedures.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum procedimento cadastrado</p>
            <div className="space-x-2">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Procedimento
              </Button>
              <Button variant="outline" onClick={createDefaultProcedures}>
                <FileText className="h-4 w-4 mr-2" />
                Criar Procedimentos Padrão
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}