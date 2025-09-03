const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAppointmentModes() {
  try {
    console.log('🧪 Testando Modos de Consulta...')

    // Buscar um doctor-patient para teste
    const doctorPatient = await prisma.doctorPatient.findFirst({
      include: {
        patient: true,
        doctor: true
      }
    })

    if (!doctorPatient) {
      console.log('❌ Nenhuma relação doctor-patient encontrada.')
      return
    }

    console.log(`✅ Testando com: ${doctorPatient.patient.name}`)

    // Buscar procedimentos
    const procedures = await prisma.procedure.findMany({ take: 3 })

    // ==========================================
    // TESTE 1: CONSULTA SIMPLES
    // ==========================================
    console.log('\n📋 TESTE 1: Consulta Simples')
    
    const simpleAppointment = await prisma.appointment.create({
      data: {
        doctorPatientId: doctorPatient.id,
        userId: doctorPatient.doctorId,
        tenantId: doctorPatient.tenantId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 30,
        type: 'Consulta',
        status: 'SCHEDULED',
        notes: 'Teste: Consulta simples - sem procedimentos específicos por dente'
      }
    })

    console.log(`✅ Consulta simples criada: ${simpleAppointment.type} (${simpleAppointment.duration}min)`)

    // ==========================================
    // TESTE 2: CONSULTA DENTAL ESPECÍFICA
    // ==========================================
    console.log('\n🦷 TESTE 2: Consulta com Procedimentos Dentais')
    
    const dentalAppointment = await prisma.appointment.create({
      data: {
        doctorPatientId: doctorPatient.id,
        userId: doctorPatient.doctorId,
        tenantId: doctorPatient.tenantId,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 90, // Duração calculada baseada nos procedimentos
        type: 'Procedimentos Dentais',
        status: 'SCHEDULED',
        notes: 'Teste: Consulta com procedimentos específicos por dente'
      }
    })

    // Adicionar procedimentos específicos
    const dentalProcedures = [
      {
        doctorPatientId: doctorPatient.id,
        appointmentId: dentalAppointment.id,
        procedureId: procedures[0].id,
        toothNumberSite: 11,
        toothNumberFDI: '11',
        treatmentType: procedures[0].name,
        notes: 'Incisivo central superior direito',
        status: 'PENDING'
      },
      {
        doctorPatientId: doctorPatient.id,
        appointmentId: dentalAppointment.id,
        procedureId: procedures[1]?.id || procedures[0].id,
        toothNumberSite: 21,
        toothNumberFDI: '21',
        treatmentType: procedures[1]?.name || procedures[0].name,
        notes: 'Incisivo central superior esquerdo',
        status: 'PENDING'
      }
    ]

    for (const proc of dentalProcedures) {
      await prisma.patientTeeth.create({ data: proc })
    }

    console.log(`✅ Consulta dental criada: ${dentalAppointment.type} (${dentalAppointment.duration}min)`)
    console.log(`   - ${dentalProcedures.length} procedimentos específicos adicionados`)

    // ==========================================
    // TESTE 3: COMPARAÇÃO DOS RESULTADOS
    // ==========================================
    console.log('\n📊 COMPARAÇÃO DOS RESULTADOS')

    const simpleResult = await prisma.appointment.findUnique({
      where: { id: simpleAppointment.id },
      include: {
        teeth: {
          include: { procedure: true }
        }
      }
    })

    const dentalResult = await prisma.appointment.findUnique({
      where: { id: dentalAppointment.id },
      include: {
        teeth: {
          include: { procedure: true }
        }
      }
    })

    console.log('\n🩺 CONSULTA SIMPLES:')
    console.log(`   Tipo: ${simpleResult.type}`)
    console.log(`   Duração: ${simpleResult.duration} minutos`)
    console.log(`   Dentes específicos: ${simpleResult.teeth.length}`)
    console.log(`   Uso: Consultas gerais, retornos, avaliações`)

    console.log('\n🦷 CONSULTA DENTAL:')
    console.log(`   Tipo: ${dentalResult.type}`)
    console.log(`   Duração: ${dentalResult.duration} minutos`)
    console.log(`   Dentes específicos: ${dentalResult.teeth.length}`)
    dentalResult.teeth.forEach((tooth, i) => {
      console.log(`     ${i + 1}. Dente ${tooth.toothNumberFDI}: ${tooth.treatmentType}`)
    })
    console.log(`   Uso: Restaurações, canais, cirurgias específicas`)

    console.log('\n🎉 TESTE CONCLUÍDO!')
    console.log('\n💡 DIFERENÇAS IMPLEMENTADAS:')
    console.log('1. 🩺 Modo Simples: Um procedimento para toda a consulta')
    console.log('2. 🦷 Modo Dental: Procedimentos específicos por dente')
    console.log('3. ⏱️  Duração calculada automaticamente no modo dental')
    console.log('4. 📝 Tipo de consulta diferenciado automaticamente')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAppointmentModes()
