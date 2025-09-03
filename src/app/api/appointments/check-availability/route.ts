import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.date || !data.duration || !data.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: date, duration, userId' },
        { status: 400 }
      )
    }

    const appointmentDate = new Date(data.date)
    const duration = parseInt(data.duration)
    const endTime = new Date(appointmentDate.getTime() + duration * 60000)

    // Check for conflicts
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        userId: data.userId,
        status: {
          not: 'CANCELLED',
        },
        date: {
          gte: new Date(appointmentDate.getTime() - 4 * 60 * 60000), // 4 hours before
          lt: new Date(appointmentDate.getTime() + 4 * 60 * 60000), // 4 hours after
        }
      },
      select: {
        id: true,
        date: true,
        duration: true,
        type: true,
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Check for actual conflicts
    const conflicts = []
    for (const existing of conflictingAppointments) {
      const existingStart = existing.date
      const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000)

      const hasOverlap = (
        (appointmentDate >= existingStart && appointmentDate < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (appointmentDate <= existingStart && endTime >= existingEnd)
      )

      if (hasOverlap) {
        conflicts.push({
          id: existing.id,
          startTime: existingStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          endTime: existingEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          duration: existing.duration,
          type: existing.type
        })
      }
    }

    if (conflicts.length > 0) {
      // Generate alternative time suggestions
      const suggestions = generateAlternativeSlots(appointmentDate, duration, conflictingAppointments)
      
      return NextResponse.json({
        available: false,
        conflicts,
        suggestions,
        message: `Horário não disponível. Conflito com ${conflicts.length} consulta(s) existente(s).`
      })
    }

    return NextResponse.json({
      available: true,
      message: 'Horário disponível'
    })

  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

function generateAlternativeSlots(requestedDate: Date, duration: number, existingAppointments: any[]) {
  const suggestions = []
  const date = new Date(requestedDate)
  date.setHours(8, 0, 0, 0) // Start at 8:00 AM

  // Generate slots for the same day
  while (date.getHours() < 18) { // Until 6:00 PM
    const slotEnd = new Date(date.getTime() + duration * 60000)
    
    // Check if this slot conflicts with existing appointments
    let hasConflict = false
    for (const existing of existingAppointments) {
      const existingStart = existing.date
      const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000)

      const hasOverlap = (
        (date >= existingStart && date < existingEnd) ||
        (slotEnd > existingStart && slotEnd <= existingEnd) ||
        (date <= existingStart && slotEnd >= existingEnd)
      )

      if (hasOverlap) {
        hasConflict = true
        break
      }
    }

    if (!hasConflict && slotEnd.getHours() <= 18) {
      suggestions.push({
        date: date.toISOString(),
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        endTime: slotEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      })
    }

    // Move to next 30-minute slot
    date.setMinutes(date.getMinutes() + 30)
    
    // Limit suggestions to avoid too many options
    if (suggestions.length >= 6) break
  }

  return suggestions
}
