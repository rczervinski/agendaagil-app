import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        doctorPatient: {
          include: {
            patient: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      patientName: appointment.doctorPatient.patient.name,
      phone: appointment.doctorPatient.patient.phone,
      time: appointment.date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration: appointment.duration,
      status: appointment.status,
      type: appointment.type,
    }))

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error('Error fetching today appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}