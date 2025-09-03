import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Today's appointments count
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Confirmed appointments today
    const confirmedAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: 'CONFIRMED',
      },
    })

    // Total patients
    const totalPatients = await prisma.patient.count({
      where: {
        isActive: true,
      },
    })

    // Pending confirmations (scheduled but not confirmed)
    const pendingConfirmations = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: 'SCHEDULED',
      },
    })

    // Reminders to be sent (appointments in next 24-48 hours that haven't had reminder sent)
    const reminderTime = new Date()
    reminderTime.setHours(reminderTime.getHours() + 24) // Next 24 hours
    const reminderEndTime = new Date()
    reminderEndTime.setHours(reminderEndTime.getHours() + 48) // Up to 48 hours

    const remindersToSend = await prisma.appointment.count({
      where: {
        date: {
          gte: reminderTime,
          lt: reminderEndTime,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
        reminderSent: false,
      },
    })

    return NextResponse.json({
      todayAppointments,
      confirmedAppointments,
      totalPatients,
      pendingConfirmations,
      remindersToSend,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}