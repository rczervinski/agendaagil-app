'use client'

import { ToothNumberingProvider } from '@/hooks/useToothNumbering'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToothNumberingProvider>
      {children}
    </ToothNumberingProvider>
  )
}
