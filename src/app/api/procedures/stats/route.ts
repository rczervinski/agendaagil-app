import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    // Get all active procedures for the tenant
    const procedures = await prisma.procedure.findMany({
      where: {
        tenantId,
        isActive: true
      }
    })

    // Get all appointments that use these procedures
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        type: {
          in: procedures.map(p => p.name)
        }
      },
      include: {
        doctorPatient: {
          include: {
            patient: true
          }
        }
      }
    })

    // Calculate statistics
    const totalActiveProcedures = procedures.length

    // Calculate average duration
    const totalDuration = procedures.reduce((sum, proc) => sum + proc.duration, 0)
    const averageDuration = totalActiveProcedures > 0 ? Math.round(totalDuration / totalActiveProcedures) : 0

    // Find most used procedure
    const procedureUsage = new Map<string, number>()
    appointments.forEach(appointment => {
      const count = procedureUsage.get(appointment.type) || 0
      procedureUsage.set(appointment.type, count + 1)
    })

    let mostUsedProcedure = 'Nenhum'
    let maxUsage = 0
    procedureUsage.forEach((count, procedureName) => {
      if (count > maxUsage) {
        maxUsage = count
        mostUsedProcedure = procedureName
      }
    })

    // Calculate average price
    const proceduresWithPrice = procedures.filter(p => p.price && p.price > 0)
    const totalPrice = proceduresWithPrice.reduce((sum, proc) => sum + (proc.price || 0), 0)
    const averagePrice = proceduresWithPrice.length > 0 ? totalPrice / proceduresWithPrice.length : 0

    const stats = {
      totalActiveProcedures,
      averageDuration,
      mostUsedProcedure,
      averagePrice: Math.round(averagePrice * 100) / 100, // Round to 2 decimal places
      totalAppointments: appointments.length,
      procedureUsage: Object.fromEntries(procedureUsage)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching procedure stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch procedure statistics' },
      { status: 500 }
    )
  }
}
