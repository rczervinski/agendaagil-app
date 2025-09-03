const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanPatients() {
  try {
    console.log('🧹 Limpando dados de pacientes...')

    // Deletar em ordem para respeitar as foreign keys
    
    // 1. Primeiro deletar registros de dentes dos pacientes
    await prisma.patientTeeth.deleteMany()
    console.log('✅ Deleted patient teeth records')

    // 2. Deletar visitas dos pacientes
    await prisma.patientVisit.deleteMany()
    console.log('✅ Deleted patient visits')

    // 3. Deletar agendamentos
    await prisma.appointment.deleteMany()
    console.log('✅ Deleted appointments')

    // 4. Deletar relações doutor-paciente
    await prisma.doctorPatient.deleteMany()
    console.log('✅ Deleted doctor-patient relationships')

    // 5. Por último, deletar os pacientes
    await prisma.patient.deleteMany()
    console.log('✅ Deleted patients')

    console.log('🎉 Limpeza de pacientes concluída com sucesso!')
    console.log('ℹ️  Dados de usuários/doutores e configurações foram mantidos')

  } catch (error) {
    console.error('❌ Erro ao limpar pacientes:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanPatients()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })