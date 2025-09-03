'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth as useAuthHook } from '@/hooks/useAuth'

interface UserData {
  id: string
  tenantId: string
  doctorId: string
  doctorName: string
  tenantName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  cro?: string
  specialties?: string[]
}

interface AuthContextType {
  userData: UserData | null
  loading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}