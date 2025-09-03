'use client'

import { useAuth } from '@/hooks/useAuth'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { ClinicsManager } from '@/components/ClinicsManager'

export default function ClinicsPage() {
  const { userData } = useAuth()

  if (!userData?.id) {
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
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar currentPage="clinics" />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            <ClinicsManager doctorId={userData.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
