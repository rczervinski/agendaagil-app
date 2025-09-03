import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctorPatient: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        visit: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    const formattedAppointment = {
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
      patient: {
        id: appointment.doctorPatient.patient.id,
        name: appointment.doctorPatient.patient.name,
        phone: appointment.doctorPatient.patient.phone,
      },
      doctor: {
        id: appointment.user.id,
        name: `${appointment.user.firstName} ${appointment.user.lastName}`,
      },
      visit: appointment.visit,
      reminderSent: appointment.reminderSent,
      confirmationSent: appointment.confirmationSent,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedAppointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  return updateAppointment(request, { id })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  return updateAppointment(request, { id })
}

async function updateAppointment(
  request: Request,
  params: { id: string }
) {
  try {
    const data = await request.json()

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // If updating date/time, check for conflicts
    if (data.date && data.date !== existingAppointment.date.toISOString()) {
      const appointmentDate = new Date(data.date)
      const duration = data.duration || existingAppointment.duration
      const endTime = new Date(appointmentDate.getTime() + duration * 60000)
      
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: params.id }, // Exclude current appointment
          userId: existingAppointment.userId,
          date: {
            lt: endTime,
          },
          AND: {
            date: {
              gte: new Date(appointmentDate.getTime() - duration * 60000),
            },
          },
          status: {
            not: 'CANCELLED',
          },
        },
      })

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'Time slot is already booked' },
          { status: 409 }
        )
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.duration && { duration: data.duration }),
        ...(data.status && { status: data.status }),
        ...(data.type && { type: data.type }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.reminderSent !== undefined && { reminderSent: data.reminderSent }),
        ...(data.confirmationSent !== undefined && { confirmationSent: data.confirmationSent }),
      },
      include: {
        doctorPatient: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    const formattedAppointment = {
      id: updatedAppointment.id,
      date: updatedAppointment.date.toISOString(),
      time: updatedAppointment.date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration: updatedAppointment.duration,
      status: updatedAppointment.status,
      type: updatedAppointment.type,
      notes: updatedAppointment.notes,
      price: updatedAppointment.price,
      patient: {
        id: updatedAppointment.doctorPatient.patient.id,
        name: updatedAppointment.doctorPatient.patient.name,
        phone: updatedAppointment.doctorPatient.patient.phone,
      },
      doctor: {
        id: updatedAppointment.user.id,
        name: `${updatedAppointment.user.firstName} ${updatedAppointment.user.lastName}`,
      },
      reminderSent: updatedAppointment.reminderSent,
      confirmationSent: updatedAppointment.confirmationSent,
      createdAt: updatedAppointment.createdAt.toISOString(),
      updatedAt: updatedAppointment.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedAppointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Delete related visit if exists
    await prisma.patientVisit.deleteMany({
      where: { appointmentId: id }
    })

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
