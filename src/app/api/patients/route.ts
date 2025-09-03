import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatPhoneForStorage, formatPhoneForDisplay } from '@/lib/phoneUtils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const tenantId = searchParams.get('tenantId')

    if (!doctorId || doctorId === 'loading') {
      return NextResponse.json(
        { error: 'Doctor ID is required and user data must be loaded' },
        { status: 400 }
      )
    }

    // Get doctor's patients through DoctorPatient relationships
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
            updatedAt: true,
            isActive: true,
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

    const formattedPatients = doctorPatients.map((dp: any) => ({
      id: dp.patient.id,
      doctorPatientId: dp.id,
      name: dp.patient.name,
      phone: formatPhoneForDisplay(dp.patient.phone),
      birthDate: dp.patient.birthDate?.toISOString().split('T')[0],
      cpf: dp.patient.cpf,
      gender: dp.patient.gender,
      notes: dp.notes,
      contactSource: dp.patient.contactSource,
      whatsappId: dp.patient.whatsappId,
      lastContact: dp.patient.lastContact?.toISOString(),
      appointmentCount: dp._count.appointments,
      createdAt: dp.patient.createdAt.toISOString(),
      updatedAt: dp.patient.updatedAt.toISOString(),
      status: dp.patient.isActive ? 'active' : 'inactive',
    }))

    return NextResponse.json(formattedPatients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.doctorId || !data.tenantId || !data.name || !data.phone) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, tenantId, name, phone' },
        { status: 400 }
      )
    }

    // Calculate birthDate from age if provided
    let birthDate = null
    if (data.birthDate) {
      birthDate = new Date(data.birthDate)
    } else if (data.age) {
      const currentYear = new Date().getFullYear()
      birthDate = new Date(currentYear - parseInt(data.age), 0, 1)
    }

    // Normalize phone number for storage and searching
    const normalizedPhone = formatPhoneForStorage(data.phone)
    
    // First, find or create the global patient
    let patient = await prisma.patient.findUnique({
      where: { phone: normalizedPhone }
    })

    if (!patient) {
      // Create new global patient
      patient = await prisma.patient.create({
        data: {
          name: data.name,
          phone: normalizedPhone,
          cpf: data.cpf || null,
          birthDate,
          gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER' | null,
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
        notes: data.medicalNotes || data.notes || null,
      },
      include: {
        patient: true
      }
    })

    const formattedPatient = {
      id: doctorPatient.patient.id,
      doctorPatientId: doctorPatient.id,
      name: doctorPatient.patient.name,
      phone: formatPhoneForDisplay(doctorPatient.patient.phone),
      birthDate: doctorPatient.patient.birthDate?.toISOString().split('T')[0],
      cpf: doctorPatient.patient.cpf,
      gender: doctorPatient.patient.gender,
      notes: doctorPatient.notes,
      contactSource: doctorPatient.patient.contactSource,
      createdAt: doctorPatient.patient.createdAt.toISOString(),
      status: doctorPatient.patient.isActive ? 'active' : 'inactive',
    }

    return NextResponse.json(formattedPatient, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}