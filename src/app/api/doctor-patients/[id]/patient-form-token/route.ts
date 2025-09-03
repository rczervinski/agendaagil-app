import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorPatientId } = await context.params
    console.log('POST patient-form-token - doctorPatientId:', doctorPatientId)

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

    console.log('doctorPatient found:', !!doctorPatient)

    if (!doctorPatient) {
      console.log('Doctor patient relationship not found for ID:', doctorPatientId)
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')
    
    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create or update patient form token
    const patientFormToken = await prisma.patientFormToken.upsert({
      where: { doctorPatientId },
      update: {
        token,
        expiresAt,
        used: false,
      },
      create: {
        doctorPatientId,
        token,
        expiresAt,
        used: false,
      }
    })

    // Generate the public URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const publicUrl = `${baseUrl}/patient-form/${token}`

    return NextResponse.json({
      token: patientFormToken.token,
      url: publicUrl,
      expiresAt: patientFormToken.expiresAt,
      patient: {
        name: doctorPatient.patient.name,
        phone: doctorPatient.patient.phone,
      },
      doctor: {
        name: `${doctorPatient.doctor.firstName} ${doctorPatient.doctor.lastName}`,
      }
    })
  } catch (error) {
    console.error('Error generating patient form token:', error)
    return NextResponse.json(
      { error: 'Failed to generate patient form token' },
      { status: 500 }
    )
  }
}

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

    // Get existing token if any
    const patientFormToken = await prisma.patientFormToken.findUnique({
      where: { doctorPatientId }
    })

    if (!patientFormToken) {
      return NextResponse.json({ token: null })
    }

    // Check if token is expired
    const now = new Date()
    const isExpired = patientFormToken.expiresAt < now

    // Generate the public URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const publicUrl = `${baseUrl}/patient-form/${patientFormToken.token}`

    return NextResponse.json({
      token: patientFormToken.token,
      url: publicUrl,
      expiresAt: patientFormToken.expiresAt,
      used: patientFormToken.used,
      expired: isExpired,
      patient: {
        name: doctorPatient.patient.name,
        phone: doctorPatient.patient.phone,
      },
      doctor: {
        name: `${doctorPatient.doctor.firstName} ${doctorPatient.doctor.lastName}`,
      }
    })
  } catch (error) {
    console.error('Error fetching patient form token:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient form token' },
      { status: 500 }
    )
  }
}
