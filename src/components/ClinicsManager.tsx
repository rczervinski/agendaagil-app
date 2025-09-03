'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react"

interface Clinic {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  description?: string
  isActive: boolean
}

interface ClinicsManagerProps {
  doctorId: string
  onClinicSelect?: (clinic: Clinic) => void
}

export function ClinicsManager({ doctorId, onClinicSelect }: ClinicsManagerProps) {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  })

  useEffect(() => {
    loadClinics()
  }, [doctorId])

  const loadClinics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/clinics?doctorId=${doctorId}`)
      if (response.ok) {
        const data = await response.json()
        setClinics(data)
      } else {
        console.error('Failed to load clinics')
      }
    } catch (error) {
      console.error('Error loading clinics:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      alert('Nome é obrigatório')
      return
    }

    try {
      const url = editingClinic ? '/api/clinics' : '/api/clinics'
      const method = editingClinic ? 'PUT' : 'POST'
      const body = editingClinic 
        ? { id: editingClinic.id, ...formData }
        : { ...formData, doctorId }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        await loadClinics()
        resetForm()
        setShowAddForm(false)
        setEditingClinic(null)
      } else {
        const error = await response.text()
        alert(`Erro: ${error}`)
      }
    } catch (error) {
      console.error('Error saving clinic:', error)
      alert('Erro ao salvar clínica')
    }
  }

  const handleEdit = (clinic: Clinic) => {
    setEditingClinic(clinic)
    setFormData({
      name: clinic.name,
      address: clinic.address || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      description: clinic.description || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (clinicId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return

    try {
      const response = await fetch(`/api/clinics?id=${clinicId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadClinics()
      } else {
        alert('Erro ao excluir clínica')
      }
    } catch (error) {
      console.error('Error deleting clinic:', error)
      alert('Erro ao excluir clínica')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clínicas</h2>
        <Button
          onClick={() => {
            resetForm()
            setEditingClinic(null)
            setShowAddForm(true)
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Clínica</span>
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClinic ? 'Editar Clínica' : 'Nova Clínica'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingClinic ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingClinic(null)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clinics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clinics.map((clinic) => (
          <Card key={clinic.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{clinic.name}</h3>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(clinic)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(clinic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {clinic.address && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  {clinic.address}
                </div>
              )}
              
              {clinic.phone && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Phone className="h-4 w-4 mr-2" />
                  {clinic.phone}
                </div>
              )}
              
              {clinic.email && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  {clinic.email}
                </div>
              )}
              
              {clinic.description && (
                <p className="text-sm text-gray-600 mt-2">{clinic.description}</p>
              )}
              
              {onClinicSelect && (
                <Button
                  className="w-full mt-3"
                  variant="outline"
                  onClick={() => onClinicSelect(clinic)}
                >
                  Selecionar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {clinics.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma clínica cadastrada</p>
          <Button
            onClick={() => {
              resetForm()
              setEditingClinic(null)
              setShowAddForm(true)
            }}
            className="mt-4"
          >
            Cadastrar primeira clínica
          </Button>
        </div>
      )}
    </div>
  )
}
