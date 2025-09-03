import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  try {
    console.log('🧹 Cleaning database...')

    // Delete in order to respect foreign key constraints
    await prisma.patientVisit.deleteMany()
    console.log('✅ Deleted patient visits')

    await prisma.whatsAppMessage.deleteMany()
    console.log('✅ Deleted WhatsApp messages')

    await prisma.messageTemplate.deleteMany()
    console.log('✅ Deleted message templates')

    await prisma.appointment.deleteMany()
    console.log('✅ Deleted appointments')

    await prisma.patient.deleteMany()
    console.log('✅ Deleted patients')

    await prisma.subscription.deleteMany()
    console.log('✅ Deleted subscriptions')

    await prisma.tenantSettings.deleteMany()
    console.log('✅ Deleted tenant settings')

    await prisma.user.deleteMany()
    console.log('✅ Deleted users')

    await prisma.tenant.deleteMany()
    console.log('✅ Deleted tenants')

    console.log('🎉 Database reset completed successfully!')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
