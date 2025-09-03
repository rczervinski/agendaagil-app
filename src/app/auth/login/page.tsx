'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smile, User, Stethoscope } from "lucide-react"

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Smile className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AgendaÁgil</span>
          </div>
          <CardTitle className="text-2xl">Bem-vindo</CardTitle>
          <CardDescription>
            Escolha como deseja acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Link href="/auth/patient-login">
              <Button
                variant="outline"
                className="w-full h-16 flex items-center justify-center space-x-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <User className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Sou Paciente</div>
                  <div className="text-sm text-gray-500">Acessar minhas consultas</div>
                </div>
              </Button>
            </Link>

            <Link href="/auth/doctor-login">
              <Button
                variant="outline"
                className="w-full h-16 flex items-center justify-center space-x-3 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              >
                <Stethoscope className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Sou Profissional</div>
                  <div className="text-sm text-gray-500">Médico ou Administrador</div>
                </div>
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500 mt-6">
            Sistema de autenticação por código SMS/WhatsApp
          </div>
        </CardContent>
      </Card>
    </div>
  )
}