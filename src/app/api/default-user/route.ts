import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first tenant and user for development purposes
    const tenant = await prisma.tenant.findFirst()
    const user = await prisma.user.findFirst({
      where: {
        role: {
          in: ['OWNER', 'DOCTOR']
        },
        isActive: true
      }
    })

    if (!tenant || !user) {
      return NextResponse.json(
        { error: 'No default tenant or doctor found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      tenantId: tenant.id,
      doctorId: user.id,
      doctorName: `${user.firstName} ${user.lastName}`,
      tenantName: tenant.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      cro: user.cro,
      specialties: user.specialties || []
    })
  } catch (error) {
    console.error('Error getting default user:', error)
    return NextResponse.json(
      { error: 'Failed to get default user' },
      { status: 500 }
    )
  }
}