import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Smile,
  Bell,
  Settings,
  LogOut
} from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Smile className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AgendaÁgil</span>
          </Link>
          <div className="text-sm text-gray-500">
            Dr. João Silva - Clínica Odontológica Silva
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}