import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatPhoneForStorage, formatPhoneForDisplay } from '@/lib/phoneUtils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const doctorId = searchParams.get('doctorId')

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Normalize phone number for exact matching
    const normalizedPhone = formatPhoneForStorage(phone)

    // Search for patient by exact phone number match (try both normalized and original format)
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: phone },
          { phone: formatPhoneForDisplay(phone) }
        ]
      },
      select: {
        id: true,
        name: true,
        phone: true,
        birthDate: true,
        cpf: true,
        gender: true,
        contactSource: true,
        whatsappId: true,
        createdAt: true,
        isActive: true,
      }
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      )
    }

    // Check if doctor-patient relationship exists
    const doctorPatient = await prisma.doctorPatient.findFirst({
      where: {
        patientId: patient.id,
        doctorId: doctorId,
        isActive: true
      }
    })

    // Calculate age from birthDate
    const age = patient.birthDate 
      ? Math.floor((new Date().getTime() - patient.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null

    // Return all patient data (no privacy restrictions)
    const formattedPatient = {
      id: patient.id,
      doctorPatientId: doctorPatient?.id || null,
      name: patient.name,
      phone: formatPhoneForDisplay(patient.phone),
      age,
      birthDate: patient.birthDate?.toISOString(),
      cpf: patient.cpf,
      gender: patient.gender,
      notes: doctorPatient?.notes || null,
      contactSource: patient.contactSource,
      whatsappId: patient.whatsappId,
      hasRelationship: !!doctorPatient,
      createdAt: patient.createdAt.toISOString(),
    }

    return NextResponse.json(formattedPatient)
  } catch (error) {
    console.error('Error searching patient:', error)
    return NextResponse.json(
      { error: 'Failed to search patient' },
      { status: 500 }
    )
  }
}
