import { useState, useEffect } from 'react'

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

export function useAuth() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Force clear localStorage for testing (only on client)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userData')
        }
        
        // Fetch from API
        console.log('Fetching user data from /api/default-user')
        const response = await fetch('/api/default-user')
        if (response.ok) {
          const data = await response.json()
          console.log('Received user data:', data)
          setUserData(data)
          
          // Save to localStorage only on client
          if (typeof window !== 'undefined') {
            localStorage.setItem('userData', JSON.stringify(data))
          }
        } else {
          console.error('Failed to load user data, response:', response.status, await response.text())
          // Provide fallback that won't work for database operations
          // but won't break the UI
          setUserData({
            id: 'loading',
            tenantId: 'loading',
            doctorId: 'loading', 
            doctorName: 'Carregando...',
            tenantName: 'Carregando...',
            firstName: 'Carregando',
            lastName: '...',
            email: 'loading@example.com',
            phone: 'loading',
            role: 'loading'
          })
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        setUserData({
          id: 'loading',
          tenantId: 'loading',
          doctorId: 'loading', 
          doctorName: 'Carregando...',
          tenantName: 'Carregando...',
          firstName: 'Carregando',
          lastName: '...',
          email: 'loading@example.com',
          phone: 'loading',
          role: 'loading'
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const signOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData')
      setUserData(null)
      window.location.href = '/auth/login'
    }
  }

  return { userData, loading, signOut }
}