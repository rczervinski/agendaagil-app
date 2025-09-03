'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { NumberingSystem } from '@/components/dental/utils/toothTypes'

interface ToothNumberingContextType {
  numberingSystem: NumberingSystem
  setNumberingSystem: (system: NumberingSystem) => void
  isLoading: boolean
  updateSettings: (system: NumberingSystem) => Promise<void>
}

const ToothNumberingContext = createContext<ToothNumberingContextType | null>(null)

export function ToothNumberingProvider({ children }: { children: ReactNode }) {
  const { userData } = useAuth()
  const [numberingSystem, setNumberingSystemState] = useState<NumberingSystem>(NumberingSystem.FDI)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar configuração do tenant
  useEffect(() => {
    if (userData?.tenantId) {
      loadToothNumberingSettings()
    }
  }, [userData?.tenantId])

  const loadToothNumberingSettings = async () => {
    try {
      const response = await fetch(`/api/tenant-settings/${userData?.tenantId}`)
      if (response.ok) {
        const settings = await response.json()
        const system = settings.toothNumberingSystem === 'UNIVERSAL' 
          ? NumberingSystem.UNIVERSAL 
          : NumberingSystem.FDI
        setNumberingSystemState(system)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de numeração:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (system: NumberingSystem) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tenant-settings/${userData?.tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toothNumberingSystem: system === NumberingSystem.FDI ? 'FDI' : 'UNIVERSAL'
        })
      })

      if (response.ok) {
        setNumberingSystemState(system)
      } else {
        throw new Error('Falha ao atualizar configurações')
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const setNumberingSystem = (system: NumberingSystem) => {
    setNumberingSystemState(system)
    // Atualizar no servidor de forma assíncrona
    updateSettings(system).catch(console.error)
  }

  const contextValue: ToothNumberingContextType = {
    numberingSystem,
    setNumberingSystem,
    isLoading,
    updateSettings
  }

  return (
    <ToothNumberingContext.Provider value={contextValue}>
      {children}
    </ToothNumberingContext.Provider>
  )
}

export function useToothNumbering() {
  const context = useContext(ToothNumberingContext)
  if (!context) {
    throw new Error('useToothNumbering deve ser usado dentro de ToothNumberingProvider')
  }
  return context
}
