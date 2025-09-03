import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Find the doctor-patient relationship
    const doctorPatient = await prisma.doctorPatient.findFirst({
      where: {
        patientId: id,
        doctorId: doctorId,
        isActive: true
      },
      include: {
        patient: {
          include: {
            messages: {
              orderBy: {
                sentAt: 'desc',
              },
              take: 10, // Last 10 messages
            }
          }
        },
        appointments: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
        },
        visits: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Patient not found for this doctor' },
        { status: 404 }
      )
    }

    const formattedPatient = {
      id: doctorPatient.patient.id,
      doctorPatientId: doctorPatient.id,
      name: doctorPatient.patient.name,
      email: doctorPatient.email,
      phone: doctorPatient.patient.phone,
      birthDate: doctorPatient.patient.birthDate?.toISOString().split('T')[0],
      address: doctorPatient.address,
      cpf: doctorPatient.patient.cpf,
      gender: doctorPatient.patient.gender,
      notes: doctorPatient.notes,
      allergies: doctorPatient.allergies,
      medications: doctorPatient.medications,
      emergencyContact: doctorPatient.emergencyContact,
      medicalHistory: doctorPatient.medicalHistory,
      contactSource: doctorPatient.patient.contactSource,
      whatsappId: doctorPatient.patient.whatsappId,
      lastContact: doctorPatient.patient.lastContact?.toISOString(),
      createdAt: doctorPatient.patient.createdAt.toISOString(),
      updatedAt: doctorPatient.patient.updatedAt.toISOString(),
      status: doctorPatient.patient.isActive ? 'active' : 'inactive',
      appointments: doctorPatient.appointments.map(appointment => ({
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
        doctor: `${appointment.user.firstName} ${appointment.user.lastName}`,
      })),
      visits: doctorPatient.visits,
      recentMessages: doctorPatient.patient.messages.map(message => ({
        id: message.id,
        direction: message.direction,
        content: message.content,
        type: message.type,
        status: message.status,
        sentAt: message.sentAt.toISOString(),
      })),
    }

    return NextResponse.json(formattedPatient)
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const data = await request.json()
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Check if doctor-patient relationship exists
    const existingDoctorPatient = await prisma.doctorPatient.findFirst({
      where: {
        patientId: id,
        doctorId: doctorId,
        isActive: true
      },
      include: {
        patient: true
      }
    })

    if (!existingDoctorPatient) {
      return NextResponse.json(
        { error: 'Patient not found for this doctor' },
        { status: 404 }
      )
    }

    // Update global patient data if provided
    let updatedPatient = existingDoctorPatient.patient
    if (data.name || data.phone || data.cpf || data.birthDate || data.gender) {
      // If updating phone, check for conflicts
      if (data.phone && data.phone !== existingDoctorPatient.patient.phone) {
        const conflictingPatient = await prisma.patient.findFirst({
          where: {
            phone: data.phone,
            id: { not: id },
            isActive: true,
          }
        })

        if (conflictingPatient) {
          return NextResponse.json(
            { error: 'Patient with this phone number already exists' },
            { status: 409 }
          )
        }
      }

      updatedPatient = await prisma.patient.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.phone && { phone: data.phone }),
          ...(data.birthDate !== undefined && { 
            birthDate: data.birthDate ? new Date(data.birthDate) : null 
          }),
          ...(data.cpf !== undefined && { cpf: data.cpf }),
          ...(data.gender !== undefined && { gender: data.gender }),
          ...(data.contactSource && { contactSource: data.contactSource }),
          ...(data.whatsappId !== undefined && { whatsappId: data.whatsappId }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      })
    }

    // Update doctor-specific patient data
    const updatedDoctorPatient = await prisma.doctorPatient.update({
      where: { id: existingDoctorPatient.id },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.allergies !== undefined && { allergies: data.allergies }),
        ...(data.medications !== undefined && { medications: data.medications }),
        ...(data.emergencyContact !== undefined && { emergencyContact: data.emergencyContact }),
        ...(data.medicalHistory !== undefined && { medicalHistory: data.medicalHistory }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    const formattedPatient = {
      id: updatedPatient.id,
      doctorPatientId: updatedDoctorPatient.id,
      name: updatedPatient.name,
      email: updatedDoctorPatient.email,
      phone: updatedPatient.phone,
      birthDate: updatedPatient.birthDate?.toISOString().split('T')[0],
      address: updatedDoctorPatient.address,
      cpf: updatedPatient.cpf,
      gender: updatedPatient.gender,
      notes: updatedDoctorPatient.notes,
      allergies: updatedDoctorPatient.allergies,
      medications: updatedDoctorPatient.medications,
      emergencyContact: updatedDoctorPatient.emergencyContact,
      medicalHistory: updatedDoctorPatient.medicalHistory,
      contactSource: updatedPatient.contactSource,
      whatsappId: updatedPatient.whatsappId,
      lastContact: updatedPatient.lastContact?.toISOString(),
      createdAt: updatedPatient.createdAt.toISOString(),
      updatedAt: updatedPatient.updatedAt.toISOString(),
      status: updatedPatient.isActive ? 'active' : 'inactive',
    }

    return NextResponse.json(formattedPatient)
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Check if doctor-patient relationship exists
    const existingDoctorPatient = await prisma.doctorPatient.findFirst({
      where: {
        patientId: id,
        doctorId: doctorId,
        isActive: true
      }
    })

    if (!existingDoctorPatient) {
      return NextResponse.json(
        { error: 'Patient not found for this doctor' },
        { status: 404 }
      )
    }

    // Check if patient has future appointments with this doctor
    const futureAppointments = await prisma.appointment.findMany({
      where: {
        doctorPatientId: existingDoctorPatient.id,
        date: {
          gte: new Date(),
        },
        status: {
          not: 'CANCELLED',
        },
      },
    })

    if (futureAppointments.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete patient with future appointments. Cancel appointments first.',
          futureAppointments: futureAppointments.length 
        },
        { status: 409 }
      )
    }

    // Soft delete - mark doctor-patient relationship as inactive
    await prisma.doctorPatient.update({
      where: { id: existingDoctorPatient.id },
      data: { isActive: false }
    })

    return NextResponse.json(
      { message: 'Patient relationship deactivated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    )
  }
}
