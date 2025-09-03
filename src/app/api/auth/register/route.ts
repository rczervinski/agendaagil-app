import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password', 'clinicName']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (data.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create tenant (clinic) first
    const tenant = await prisma.tenant.create({
      data: {
        name: data.clinicName,
        slug: data.clinicName.toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
          .replace(/^-+|-+$/g, ''), // Trim hyphens from start/end
        phone: data.phone,
        email: data.email,
        plan: 'TRIAL',
        status: 'TRIAL',
        trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      }
    })

    // Create user (doctor)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'DOCTOR',
        cro: data.cro || null,
        specialties: data.specialties ? [data.specialties] : [],
        tenantId: tenant.id,
        // Note: In a real app, you'd store the hashed password
        // For now, we're not storing passwords in the schema
      }
    })

    // Create default tenant settings
    await prisma.tenantSettings.create({
      data: {
        tenantId: tenant.id,
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHoursStart: '08:00',
        workingHoursEnd: '18:00',
        lunchBreakStart: '12:00',
        lunchBreakEnd: '13:00',
        defaultDuration: 30,
        slotInterval: 15,
        enableLunchBreak: true,
        advanceBookingDays: 30,
        allowOnlineBooking: true,
        whatsappEnabled: false,
        autoReplyEnabled: true,
        reminderEnabled: true,
        reminderHoursBefore: 24,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      }
    })

    // Return success response (exclude sensitive data)
    const response = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
        trialEnds: tenant.trialEnds,
      },
      message: 'Account created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }
      if (error.message.includes('slug')) {
        return NextResponse.json(
          { error: 'Clinic name already exists, please choose a different name' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}