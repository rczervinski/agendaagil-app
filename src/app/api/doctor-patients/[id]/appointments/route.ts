import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorPatientId } = await context.params

    // Verify doctor-patient relationship exists
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Get all appointments for this doctor-patient relationship
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorPatientId: doctorPatientId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date.toISOString(),
      time: appointment.date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration: appointment.duration,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes,
      price: appointment.price,
      doctor: {
        id: appointment.user.id,
        name: `${appointment.user.firstName} ${appointment.user.lastName}`,
      },
      patient: {
        id: doctorPatient.patient.id,
        name: doctorPatient.patient.name,
      },
      reminderSent: appointment.reminderSent,
      confirmationSent: appointment.confirmationSent,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    }))

    // Calculate statistics
    const now = new Date()
    const pastAppointments = appointments.filter(apt => apt.date < now)
    const futureAppointments = appointments.filter(apt => apt.date >= now)
    const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED')
    const cancelledAppointments = appointments.filter(apt => apt.status === 'CANCELLED')

    const lastAppointment = pastAppointments.length > 0 ? pastAppointments[0] : null
    const nextAppointment = futureAppointments.length > 0 ? 
      futureAppointments.sort((a, b) => a.date.getTime() - b.date.getTime())[0] : null

    const stats = {
      total: appointments.length,
      completed: completedAppointments.length,
      cancelled: cancelledAppointments.length,
      upcoming: futureAppointments.length,
      lastAppointment: lastAppointment ? {
        date: lastAppointment.date.toISOString(),
        type: lastAppointment.type,
        status: lastAppointment.status
      } : null,
      nextAppointment: nextAppointment ? {
        date: nextAppointment.date.toISOString(),
        type: nextAppointment.type,
        status: nextAppointment.status
      } : null
    }

    return NextResponse.json({
      appointments: formattedAppointments,
      stats,
      doctorPatient: {
        id: doctorPatient.id,
        patient: {
          id: doctorPatient.patient.id,
          name: doctorPatient.patient.name,
          phone: doctorPatient.patient.phone,
        },
        doctor: {
          id: doctorPatient.doctor.id,
          name: `${doctorPatient.doctor.firstName} ${doctorPatient.doctor.lastName}`,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching doctor patient appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor patient appointments' },
      { status: 500 }
    )
  }
}