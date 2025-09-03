'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Smile,
  Bell,
  Settings,
  LogOut,
  Calendar as CalendarIcon,
  Users, 
  MessageCircle,
  FileText
} from "lucide-react"
import { DashboardSidebar } from "@/components/DashboardSidebar"
import { ProceduresManager } from "@/components/ProceduresManager"

interface ProcedureStats {
  totalActiveProcedures: number
  averageDuration: number
  mostUsedProcedure: string
  averagePrice: number
  totalAppointments: number
  procedureUsage: Record<string, number>
}

function ProceduresPageContent() {
  const { userData, signOut } = useAuth()
  const [stats, setStats] = useState<ProcedureStats>({
    totalActiveProcedures: 0,
    averageDuration: 0,
    mostUsedProcedure: 'Nenhum',
    averagePrice: 0,
    totalAppointments: 0,
    procedureUsage: {}
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (userData?.tenantId) {
      loadProcedureStats()
    }
  }, [userData?.tenantId])

  const loadProcedureStats = async () => {
    if (!userData?.tenantId) return

    try {
      setLoadingStats(true)
      const response = await fetch(`/api/procedures/stats?tenantId=${userData.tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to load procedure stats:', await response.text())
      }
    } catch (error) {
      console.error('Error loading procedure stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (!userData?.tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Procedimentos</h1>
            <p className="text-gray-600 mt-2">
              Cadastre e gerencie os procedimentos da sua clínica
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Link>
            </Button>

            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2">
                <Smile className="h-5 w-5 text-green-500" />
                <span className="font-medium">{userData.firstName} {userData.lastName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Procedimentos</p>
                    {loadingStats ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.totalActiveProcedures}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Ativos</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Duração Média</p>
                    {loadingStats ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-green-600">
                        {`${stats.averageDuration}min`}
                      </p>
                    )}
                  </div>
                  <CalendarIcon className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mais Usado</p>
                    {loadingStats ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.mostUsedProcedure}
                      </p>
                    )}
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Médio</p>
                    {loadingStats ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.averagePrice > 0 ? `R$ ${stats.averagePrice.toFixed(2)}` : 'N/A'}
                      </p>
                    )}
                  </div>
                  <MessageCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Procedures Manager */}
          <Card>
            <CardContent className="p-6">
              <ProceduresManager
                tenantId={userData.tenantId}
                onProcedureChange={loadProcedureStats}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProceduresPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar currentPage="procedures" />
      <div className="flex-1 overflow-y-auto">
        <ProceduresPageContent />
      </div>
    </div>
  )
}