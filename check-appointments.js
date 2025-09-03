const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Verificar agendamentos
    const appointments = await prisma.appointment.findMany({
      include: {
        clinic: true
      }
    });
    
    console.log(`📅 Total de agendamentos: ${appointments.length}`);
    
    for (const appointment of appointments) {
      console.log(`\n📋 Agendamento: ${appointment.id}`);
      console.log(`   - Paciente: ${appointment.patientName}`);
      console.log(`   - Tipo: ${appointment.type}`);
      console.log(`   - Data: ${appointment.date}`);
      console.log(`   - Hora: ${appointment.time}`);
      console.log(`   - Duração: ${appointment.duration}min`);
      console.log(`   - Status: ${appointment.status}`);
      console.log(`   - Doctor: ${appointment.doctorId}`);
      console.log(`   - Tenant: ${appointment.tenantId}`);
      if (appointment.clinic) {
        console.log(`   - Local: ${appointment.clinic.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
