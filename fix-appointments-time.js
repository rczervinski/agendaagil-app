const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔧 Corrigindo agendamentos com campo time undefined...')
    
    // Buscar agendamentos com time undefined
    const appointmentsToFix = await prisma.appointment.findMany({
      where: {
        time: null
      }
    })
    
    console.log(`📋 Encontrados ${appointmentsToFix.length} agendamentos para corrigir`)
    
    for (const appointment of appointmentsToFix) {
      console.log(`\n🔧 Corrigindo agendamento ${appointment.id}:`)
      console.log(`   - Data atual: ${appointment.date}`)
      
      // Extrair hora da data
      const fullDate = new Date(appointment.date)
      const timeString = fullDate.toTimeString().slice(0, 5) // HH:MM
      const dateOnly = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate())
      
      console.log(`   - Nova data: ${dateOnly}`)
      console.log(`   - Nova hora: ${timeString}`)
      
      // Atualizar o agendamento
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          date: dateOnly,
          time: timeString
        }
      })
      
      console.log(`   ✅ Agendamento corrigido`)
    }
    
    console.log(`\n🎉 Todos os agendamentos foram corrigidos!`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
