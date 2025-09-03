import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // For now, get the first tenant and user (in a real app, this would come from session)
    const tenant = await prisma.tenant.findFirst({
      include: {
        settings: true,
        users: {
          where: {
            role: 'DOCTOR',
            isActive: true,
          },
          take: 1,
        },
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const doctor = tenant.users[0]
    const settings = tenant.settings

    const response = {
      clinic: {
        id: tenant.id,
        name: tenant.name,
        description: tenant.description,
        logo: tenant.logo,
        address: tenant.address,
        city: tenant.city,
        state: tenant.state,
        zipCode: tenant.zipCode,
        phone: tenant.phone,
        whatsapp: tenant.whatsapp,
        email: tenant.email,
        website: tenant.website,
        cnpj: tenant.cnpj,
      },
      doctor: doctor ? {
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        cro: doctor.cro,
        specialties: doctor.specialties,
        phone: doctor.phone,
        email: doctor.email,
        avatar: doctor.avatar,
      } : null,
      schedule: settings ? {
        workDays: settings.workingDays,
        workHours: {
          start: settings.workingHoursStart,
          end: settings.workingHoursEnd,
        },
        lunchBreak: {
          start: settings.lunchBreakStart,
          end: settings.lunchBreakEnd,
        },
        defaultDuration: settings.defaultDuration,
        slotInterval: settings.slotInterval,
        enableLunchBreak: settings.enableLunchBreak,
        advanceBookingDays: settings.advanceBookingDays,
        allowOnlineBooking: settings.allowOnlineBooking,
      } : {
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workHours: {
          start: '08:00',
          end: '18:00',
        },
        lunchBreak: {
          start: '12:00',
          end: '13:00',
        },
        defaultDuration: 30,
        slotInterval: 15,
        enableLunchBreak: true,
        advanceBookingDays: 30,
        allowOnlineBooking: true,
      },
      whatsapp: settings ? {
        enabled: settings.whatsappEnabled,
        number: settings.whatsappNumber,
        autoReply: settings.autoReplyEnabled,
        welcomeMessage: settings.welcomeMessage,
        outOfHoursMessage: settings.outOfHoursMessage,
        reminderEnabled: settings.reminderEnabled,
        reminderHoursBefore: settings.reminderHoursBefore,
      } : {
        enabled: false,
        number: null,
        autoReply: true,
        welcomeMessage: null,
        outOfHoursMessage: null,
        reminderEnabled: true,
        reminderHoursBefore: 24,
      },
      notifications: settings ? {
        email: settings.emailNotifications,
        sms: settings.smsNotifications,
        push: settings.pushNotifications,
      } : {
        email: true,
        sms: false,
        push: true,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    // Get the first tenant (in a real app, this would come from session)
    const tenant = await prisma.tenant.findFirst()
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Update tenant information
    if (data.clinic) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          ...(data.clinic.name && { name: data.clinic.name }),
          ...(data.clinic.description !== undefined && { description: data.clinic.description }),
          ...(data.clinic.address !== undefined && { address: data.clinic.address }),
          ...(data.clinic.city !== undefined && { city: data.clinic.city }),
          ...(data.clinic.state !== undefined && { state: data.clinic.state }),
          ...(data.clinic.zipCode !== undefined && { zipCode: data.clinic.zipCode }),
          ...(data.clinic.phone !== undefined && { phone: data.clinic.phone }),
          ...(data.clinic.whatsapp !== undefined && { whatsapp: data.clinic.whatsapp }),
          ...(data.clinic.email !== undefined && { email: data.clinic.email }),
          ...(data.clinic.website !== undefined && { website: data.clinic.website }),
          ...(data.clinic.cnpj !== undefined && { cnpj: data.clinic.cnpj }),
          ...(data.clinic.logo !== undefined && { logo: data.clinic.logo }),
        },
      })
    }

    // Update doctor information
    if (data.doctor) {
      const doctor = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          role: 'DOCTOR',
          isActive: true,
        },
      })

      if (doctor) {
        await prisma.user.update({
          where: { id: doctor.id },
          data: {
            ...(data.doctor.firstName && { firstName: data.doctor.firstName }),
            ...(data.doctor.lastName && { lastName: data.doctor.lastName }),
            ...(data.doctor.cro !== undefined && { cro: data.doctor.cro }),
            ...(data.doctor.specialties && { specialties: data.doctor.specialties }),
            ...(data.doctor.phone !== undefined && { phone: data.doctor.phone }),
            ...(data.doctor.email && { email: data.doctor.email }),
            ...(data.doctor.avatar !== undefined && { avatar: data.doctor.avatar }),
          },
        })
      }
    }

    // Update or create tenant settings
    const settingsData: any = {}
    
    if (data.schedule) {
      if (data.schedule.workDays) settingsData.workingDays = data.schedule.workDays
      if (data.schedule.workHours?.start) settingsData.workingHoursStart = data.schedule.workHours.start
      if (data.schedule.workHours?.end) settingsData.workingHoursEnd = data.schedule.workHours.end
      if (data.schedule.lunchBreak?.start) settingsData.lunchBreakStart = data.schedule.lunchBreak.start
      if (data.schedule.lunchBreak?.end) settingsData.lunchBreakEnd = data.schedule.lunchBreak.end
      if (data.schedule.defaultDuration !== undefined) settingsData.defaultDuration = data.schedule.defaultDuration
      if (data.schedule.slotInterval !== undefined) settingsData.slotInterval = data.schedule.slotInterval
      if (data.schedule.enableLunchBreak !== undefined) settingsData.enableLunchBreak = data.schedule.enableLunchBreak
      if (data.schedule.advanceBookingDays !== undefined) settingsData.advanceBookingDays = data.schedule.advanceBookingDays
      if (data.schedule.allowOnlineBooking !== undefined) settingsData.allowOnlineBooking = data.schedule.allowOnlineBooking
    }

    if (data.whatsapp) {
      if (data.whatsapp.enabled !== undefined) settingsData.whatsappEnabled = data.whatsapp.enabled
      if (data.whatsapp.number !== undefined) settingsData.whatsappNumber = data.whatsapp.number
      if (data.whatsapp.autoReply !== undefined) settingsData.autoReplyEnabled = data.whatsapp.autoReply
      if (data.whatsapp.welcomeMessage !== undefined) settingsData.welcomeMessage = data.whatsapp.welcomeMessage
      if (data.whatsapp.outOfHoursMessage !== undefined) settingsData.outOfHoursMessage = data.whatsapp.outOfHoursMessage
      if (data.whatsapp.reminderEnabled !== undefined) settingsData.reminderEnabled = data.whatsapp.reminderEnabled
      if (data.whatsapp.reminderHoursBefore !== undefined) settingsData.reminderHoursBefore = data.whatsapp.reminderHoursBefore
    }

    if (data.notifications) {
      if (data.notifications.email !== undefined) settingsData.emailNotifications = data.notifications.email
      if (data.notifications.sms !== undefined) settingsData.smsNotifications = data.notifications.sms
      if (data.notifications.push !== undefined) settingsData.pushNotifications = data.notifications.push
    }

    if (Object.keys(settingsData).length > 0) {
      await prisma.tenantSettings.upsert({
        where: { tenantId: tenant.id },
        update: settingsData,
        create: {
          tenantId: tenant.id,
          ...settingsData,
        },
      })
    }

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
