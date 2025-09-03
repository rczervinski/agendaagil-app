const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestAppointments() {
  try {
    // Get the existing user and patient
    const user = await prisma.user.findFirst({
      where: { firstName: 'João' }
    })
    
    if (!user) {
      console.log('User not found')
      return
    }

    const patient = await prisma.patient.findFirst({
      where: { tenantId: user.tenantId }
    })

    if (!patient) {
      console.log('Patient not found')
      return
    }

    // Create appointments with different durations for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const appointments = [
      {
        date: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 09:00
        duration: 60, // 1 hour (2 slots)
        type: 'Consulta Completa',
        status: 'CONFIRMED',
        notes: 'Consulta de 60 minutos - ocupa 2 slots',
        tenantId: user.tenantId,
        userId: user.id,
        patientId: patient.id,
      },
      {
        date: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00
        duration: 90, // 1.5 hours (3 slots)
        type: 'Procedimento Cirúrgico',
        status: 'SCHEDULED',
        notes: 'Procedimento de 90 minutos - ocupa 3 slots',
        tenantId: user.tenantId,
        userId: user.id,
        patientId: patient.id,
      },
      {
        date: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 14:00
        duration: 30, // 30 minutes (1 slot)
        type: 'Limpeza',
        status: 'CONFIRMED',
        notes: 'Limpeza rápida de 30 minutos - ocupa 1 slot',
        tenantId: user.tenantId,
        userId: user.id,
        patientId: patient.id,
      },
      {
        date: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 15:00
        duration: 120, // 2 hours (4 slots)
        type: 'Tratamento de Canal',
        status: 'SCHEDULED',
        notes: 'Tratamento de canal de 120 minutos - ocupa 4 slots',
        tenantId: user.tenantId,
        userId: user.id,
        patientId: patient.id,
      }
    ]

    // Delete existing appointments for today to avoid conflicts
    await prisma.appointment.deleteMany({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    // Create new appointments
    for (const appointmentData of appointments) {
      const appointment = await prisma.appointment.create({
        data: appointmentData,
        include: {
          patient: true,
          user: true
        }
      })
      
      console.log(`✅ Created appointment: ${appointment.type} at ${appointment.date.toLocaleTimeString()} (${appointment.duration}min)`)
    }

    console.log('\n🎉 Test appointments created successfully!')
    console.log('📅 Check the calendar to see appointments with different durations:')
    console.log('   - 09:00-10:00: Consulta Completa (60min, 2 slots)')
    console.log('   - 11:00-12:30: Procedimento Cirúrgico (90min, 3 slots)')
    console.log('   - 14:00-14:30: Limpeza (30min, 1 slot)')
    console.log('   - 15:00-17:00: Tratamento de Canal (120min, 4 slots)')

  } catch (error) {
    console.error('Error creating test appointments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestAppointments()
