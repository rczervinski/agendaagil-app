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

    // Get clinical record
    const clinicalRecord = await prisma.patientClinicalRecord.findUnique({
      where: { doctorPatientId }
    })

    return NextResponse.json({
      doctorPatient: {
        id: doctorPatient.id,
        patient: doctorPatient.patient,
        doctor: doctorPatient.doctor
      },
      clinicalRecord
    })
  } catch (error) {
    console.error('Error fetching clinical record:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinical record' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorPatientId } = await context.params
    const data = await request.json()

    // Verify doctor-patient relationship exists
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Check if clinical record already exists
    const existingRecord = await prisma.patientClinicalRecord.findUnique({
      where: { doctorPatientId }
    })

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Clinical record already exists for this patient' },
        { status: 409 }
      )
    }

    // Create clinical record
    const clinicalRecord = await prisma.patientClinicalRecord.create({
      data: {
        doctorPatientId,
        name: data.name,
        rg: data.rg,
        cpf: data.cpf,
        issuingOrgan: data.issuingOrgan,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        profession: data.profession,
        phone: data.phone,
        email: data.email,
        address: data.address,
        addressNumber: data.addressNumber,
        neighborhood: data.neighborhood,
        zipCode: data.zipCode,
        guardianName: data.guardianName,
        guardianRg: data.guardianRg,
        guardianCpf: data.guardianCpf,
        guardianIssuingOrgan: data.guardianIssuingOrgan,
        guardianMaritalStatus: data.guardianMaritalStatus,
        guardianSpouse: data.guardianSpouse,
      }
    })

    return NextResponse.json(clinicalRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating clinical record:', error)
    return NextResponse.json(
      { error: 'Failed to create clinical record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorPatientId } = await context.params
    const data = await request.json()

    // Verify doctor-patient relationship exists
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Doctor patient relationship not found' },
        { status: 404 }
      )
    }

    // Update or create clinical record
    const clinicalRecord = await prisma.patientClinicalRecord.upsert({
      where: { doctorPatientId },
      update: {
        name: data.name,
        rg: data.rg,
        cpf: data.cpf,
        issuingOrgan: data.issuingOrgan,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        profession: data.profession,
        phone: data.phone,
        email: data.email,
        address: data.address,
        addressNumber: data.addressNumber,
        neighborhood: data.neighborhood,
        zipCode: data.zipCode,
        guardianName: data.guardianName,
        guardianRg: data.guardianRg,
        guardianCpf: data.guardianCpf,
        guardianIssuingOrgan: data.guardianIssuingOrgan,
        guardianMaritalStatus: data.guardianMaritalStatus,
        guardianSpouse: data.guardianSpouse,
      },
      create: {
        doctorPatientId,
        name: data.name,
        rg: data.rg,
        cpf: data.cpf,
        issuingOrgan: data.issuingOrgan,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        profession: data.profession,
        phone: data.phone,
        email: data.email,
        address: data.address,
        addressNumber: data.addressNumber,
        neighborhood: data.neighborhood,
        zipCode: data.zipCode,
        guardianName: data.guardianName,
        guardianRg: data.guardianRg,
        guardianCpf: data.guardianCpf,
        guardianIssuingOrgan: data.guardianIssuingOrgan,
        guardianMaritalStatus: data.guardianMaritalStatus,
        guardianSpouse: data.guardianSpouse,
      }
    })

    return NextResponse.json(clinicalRecord)
  } catch (error) {
    console.error('Error updating clinical record:', error)
    return NextResponse.json(
      { error: 'Failed to update clinical record' },
      { status: 500 }
    )
  }
}
