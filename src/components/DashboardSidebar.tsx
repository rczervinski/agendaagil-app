import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  MessageCircle,
  Settings,
  LayoutDashboard,
  FileText,
  Building2
} from "lucide-react"

interface SidebarProps {
  currentPage: 'dashboard' | 'calendar' | 'patients' | 'procedures' | 'clinics' | 'whatsapp' | 'settings'
}

export function DashboardSidebar({ currentPage }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard'
    },
    {
      id: 'calendar' as const,
      label: 'Calendário',
      icon: Calendar,
      href: '/dashboard/calendar'
    },
    {
      id: 'patients' as const,
      label: 'Pacientes',
      icon: Users,
      href: '/dashboard/patients'
    },
    {
      id: 'procedures' as const,
      label: 'Procedimentos',
      icon: FileText,
      href: '/dashboard/procedures'
    },
    {
      id: 'clinics' as const,
      label: 'Clínicas',
      icon: Building2,
      href: '/dashboard/clinics'
    },
    {
      id: 'whatsapp' as const,
      label: 'WhatsApp',
      icon: MessageCircle,
      href: '/dashboard/whatsapp'
    },
    {
      id: 'settings' as const,
      label: 'Configurações',
      icon: Settings,
      href: '/dashboard/settings'
    }
  ]

  return (
    <div className="w-16 md:w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
      <div className="p-2 md:p-6">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <Button 
                key={item.id}
                variant="ghost" 
                className={`w-full justify-center md:justify-start ${
                  isActive ? 'font-medium bg-blue-50 text-blue-700' : ''
                }`}
                asChild
              >
                <Link href={item.href} className="p-2 md:p-3">
                  <Icon className="h-4 w-4 md:mr-3 shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}