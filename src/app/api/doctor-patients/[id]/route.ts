import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            appointments: true
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

    const formattedDoctorPatient = {
      id: doctorPatient.id,
      patient: {
        id: doctorPatient.patient.id,
        name: doctorPatient.patient.name,
        phone: doctorPatient.patient.phone,
        cpf: doctorPatient.patient.cpf,
        birthDate: doctorPatient.patient.birthDate?.toISOString().split('T')[0],
        gender: doctorPatient.patient.gender,
        contactSource: doctorPatient.patient.contactSource,
        whatsappId: doctorPatient.patient.whatsappId,
        lastContact: doctorPatient.patient.lastContact?.toISOString(),
        createdAt: doctorPatient.patient.createdAt.toISOString(),
        status: doctorPatient.patient.isActive ? 'active' : 'inactive',
      },
      email: doctorPatient.email,
      address: doctorPatient.address,
      notes: doctorPatient.notes,
      allergies: doctorPatient.allergies,
      medications: doctorPatient.medications,
      emergencyContact: doctorPatient.emergencyContact,
      medicalHistory: doctorPatient.medicalHistory,
      doctorId: doctorPatient.doctorId,
      appointmentCount: doctorPatient._count.appointments,
      createdAt: doctorPatient.createdAt.toISOString(),
      updatedAt: doctorPatient.updatedAt.toISOString(),
      status: doctorPatient.isActive ? 'active' : 'inactive',
    }

    return NextResponse.json(formattedDoctorPatient)
  } catch (error) {
    console.error('Error fetching doctor patient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor patient' },
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

    // Check if doctor-patient exists
    const existingDoctorPatient = await prisma.doctorPatient.findUnique({
      where: { id },
      include: { patient: true }
    })

    if (!existingDoctorPatient) {
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Update global patient data if provided
    if (data.patientName || data.patientPhone || data.patientCpf || data.patientBirthDate || data.patientGender) {
      await prisma.patient.update({
        where: { id: existingDoctorPatient.patientId },
        data: {
          ...(data.patientName && { name: data.patientName }),
          ...(data.patientPhone && { phone: data.patientPhone }),
          ...(data.patientCpf !== undefined && { cpf: data.patientCpf }),
          ...(data.patientBirthDate && { birthDate: new Date(data.patientBirthDate) }),
          ...(data.patientGender && { gender: data.patientGender as 'MALE' | 'FEMALE' | 'OTHER' }),
        }
      })
    }

    // Update doctor-specific patient data
    const updatedDoctorPatient = await prisma.doctorPatient.update({
      where: { id },
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
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            appointments: true
          }
        }
      }
    })

    const formattedDoctorPatient = {
      id: updatedDoctorPatient.id,
      patient: {
        id: updatedDoctorPatient.patient.id,
        name: updatedDoctorPatient.patient.name,
        phone: updatedDoctorPatient.patient.phone,
        cpf: updatedDoctorPatient.patient.cpf,
        birthDate: updatedDoctorPatient.patient.birthDate?.toISOString().split('T')[0],
        gender: updatedDoctorPatient.patient.gender,
        contactSource: updatedDoctorPatient.patient.contactSource,
        whatsappId: updatedDoctorPatient.patient.whatsappId,
        lastContact: updatedDoctorPatient.patient.lastContact?.toISOString(),
        createdAt: updatedDoctorPatient.patient.createdAt.toISOString(),
        status: updatedDoctorPatient.patient.isActive ? 'active' : 'inactive',
      },
      email: updatedDoctorPatient.email,
      address: updatedDoctorPatient.address,
      notes: updatedDoctorPatient.notes,
      allergies: updatedDoctorPatient.allergies,
      medications: updatedDoctorPatient.medications,
      emergencyContact: updatedDoctorPatient.emergencyContact,
      medicalHistory: updatedDoctorPatient.medicalHistory,
      doctorId: updatedDoctorPatient.doctorId,
      appointmentCount: updatedDoctorPatient._count.appointments,
      createdAt: updatedDoctorPatient.createdAt.toISOString(),
      updatedAt: updatedDoctorPatient.updatedAt.toISOString(),
      status: updatedDoctorPatient.isActive ? 'active' : 'inactive',
    }

    return NextResponse.json(formattedDoctorPatient)
  } catch (error) {
    console.error('Error updating doctor patient:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor patient' },
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

    // Check if doctor-patient exists
    const existingDoctorPatient = await prisma.doctorPatient.findUnique({
      where: { id }
    })

    if (!existingDoctorPatient) {
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.doctorPatient.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Doctor patient relationship deactivated successfully' })
  } catch (error) {
    console.error('Error deleting doctor patient:', error)
    return NextResponse.json(
      { error: 'Failed to delete doctor patient' },
      { status: 500 }
    )
  }
}