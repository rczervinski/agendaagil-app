import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Get clinics associated with this doctor
    const doctorClinics = await prisma.doctorClinic.findMany({
      where: {
        doctorId,
        isActive: true
      },
      include: {
        clinic: true
      }
    })

    const clinics = doctorClinics.map(dc => dc.clinic)

    return NextResponse.json(clinics)
  } catch (error) {
    console.error('Error fetching clinics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address, phone, email, description, doctorId } = body

    if (!name || !doctorId) {
      return NextResponse.json(
        { error: 'Name and doctor ID are required' },
        { status: 400 }
      )
    }

    // Create clinic
    const clinic = await prisma.clinic.create({
      data: {
        name,
        address,
        phone,
        email,
        description
      }
    })

    // Associate doctor with clinic
    await prisma.doctorClinic.create({
      data: {
        doctorId,
        clinicId: clinic.id
      }
    })

    return NextResponse.json(clinic, { status: 201 })
  } catch (error) {
    console.error('Error creating clinic:', error)
    return NextResponse.json(
      { error: 'Failed to create clinic' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, address, phone, email, description } = body

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      )
    }

    const clinic = await prisma.clinic.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        email,
        description
      }
    })

    return NextResponse.json(clinic)
  } catch (error) {
    console.error('Error updating clinic:', error)
    return NextResponse.json(
      { error: 'Failed to update clinic' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      )
    }

    // Soft delete - mark as inactive
    await prisma.clinic.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting clinic:', error)
    return NextResponse.json(
      { error: 'Failed to delete clinic' },
      { status: 500 }
    )
  }
}
