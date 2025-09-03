import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        tenant: {
          include: {
            settings: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Note: In this implementation, we're not actually storing passwords
    // This is a simplified version. In production, you'd verify the hashed password:
    // const isValidPassword = await bcrypt.compare(data.password, user.hashedPassword)
    
    // For now, we'll just check if the user exists
    // TODO: Implement proper password verification when password field is added to schema

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Return user data (exclude sensitive information)
    const response = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        cro: user.cro,
        specialties: user.specialties,
        avatar: user.avatar,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        plan: user.tenant.plan,
        status: user.tenant.status,
        trialEnds: user.tenant.trialEnds,
        phone: user.tenant.phone,
        email: user.tenant.email,
        logo: user.tenant.logo,
      },
      settings: user.tenant.settings || null,
      message: 'Login successful'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}