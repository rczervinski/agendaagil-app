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

    // Get doctor's patients (DoctorPatient relationships)
    const doctorPatients = await prisma.doctorPatient.findMany({
      where: {
        doctorId: doctorId,
        isActive: true,
        ...(tenantId && { tenantId })
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            cpf: true,
            birthDate: true,
            gender: true,
            contactSource: true,
            whatsappId: true,
            lastContact: true,
            createdAt: true,
            isActive: true,
          }
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedDoctorPatients = doctorPatients.map(dp => ({
      id: dp.id,
      // Patient basic info (global)
      patient: {
        id: dp.patient.id,
        name: dp.patient.name,
        phone: dp.patient.phone,
        cpf: dp.patient.cpf,
        birthDate: dp.patient.birthDate?.toISOString().split('T')[0],
        gender: dp.patient.gender,
        contactSource: dp.patient.contactSource,
        whatsappId: dp.patient.whatsappId,
        lastContact: dp.patient.lastContact?.toISOString(),
        createdAt: dp.patient.createdAt.toISOString(),
        status: dp.patient.isActive ? 'active' : 'inactive',
      },
      // Doctor-specific patient data
      email: dp.email,
      address: dp.address,
      notes: dp.notes,
      allergies: dp.allergies,
      medications: dp.medications,
      emergencyContact: dp.emergencyContact,
      medicalHistory: dp.medicalHistory,
      // Metadata
      doctorId: dp.doctorId,
      appointmentCount: dp._count.appointments,
      createdAt: dp.createdAt.toISOString(),
      updatedAt: dp.updatedAt.toISOString(),
      status: dp.isActive ? 'active' : 'inactive',
    }))

    return NextResponse.json(formattedDoctorPatients)
  } catch (error) {
    console.error('Error fetching doctor patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor patients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.doctorId || !data.tenantId || !data.patientName || !data.patientPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, tenantId, patientName, patientPhone' },
        { status: 400 }
      )
    }

    // First, find or create the global patient
    let patient = await prisma.patient.findUnique({
      where: { phone: data.patientPhone }
    })

    if (!patient) {
      // Create new global patient
      patient = await prisma.patient.create({
        data: {
          name: data.patientName,
          phone: data.patientPhone,
          cpf: data.patientCpf || null,
          birthDate: data.patientBirthDate ? new Date(data.patientBirthDate) : null,
          gender: data.patientGender as 'MALE' | 'FEMALE' | 'OTHER' | null,
          contactSource: data.contactSource || 'MANUAL',
          whatsappId: data.whatsappId || null,
        }
      })
    }

    // Check if doctor-patient relationship already exists
    const existingDoctorPatient = await prisma.doctorPatient.findUnique({
      where: {
        doctorId_patientId: {
          doctorId: data.doctorId,
          patientId: patient.id
        }
      }
    })

    if (existingDoctorPatient) {
      return NextResponse.json(
        { error: 'Patient already exists for this doctor' },
        { status: 409 }
      )
    }

    // Create doctor-patient relationship with doctor-specific data
    const doctorPatient = await prisma.doctorPatient.create({
      data: {
        doctorId: data.doctorId,
        patientId: patient.id,
        tenantId: data.tenantId,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        allergies: data.allergies || null,
        medications: data.medications || null,
        emergencyContact: data.emergencyContact || null,
        medicalHistory: data.medicalHistory || null,
      },
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
      appointmentCount: 0,
      createdAt: doctorPatient.createdAt.toISOString(),
      updatedAt: doctorPatient.updatedAt.toISOString(),
      status: doctorPatient.isActive ? 'active' : 'inactive',
    }

    return NextResponse.json(formattedDoctorPatient, { status: 201 })
  } catch (error) {
    console.error('Error creating doctor patient:', error)
    return NextResponse.json(
      { error: 'Failed to create doctor patient' },
      { status: 500 }
    )
  }
}