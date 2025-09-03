import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const tenantId = searchParams.get('tenantId')

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Total active doctor-patient relationships
    const totalPatients = await prisma.doctorPatient.count({
      where: {
        doctorId: doctorId,
        isActive: true,
        ...(tenantId && { tenantId })
      },
    })

    // Active patients (same as total for now)
    const activePatients = totalPatients

    // Upcoming appointments (future appointments)
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        userId: doctorId,
        date: {
          gte: now,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
        ...(tenantId && { tenantId })
      },
    })

    // New patients this month
    const newPatientsThisMonth = await prisma.doctorPatient.count({
      where: {
        doctorId: doctorId,
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
        isActive: true,
        ...(tenantId && { tenantId })
      },
    })

    return NextResponse.json({
      totalPatients,
      activePatients,
      upcomingAppointments,
      newPatientsThisMonth,
    })
  } catch (error) {
    console.error('Error fetching patient stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient stats' },
      { status: 500 }
    )
  }
}
