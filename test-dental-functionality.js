const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDentalFunctionality() {
  try {
    console.log('🧪 Testando funcionalidades dentais...')

    // 1. Buscar um doctor-patient para teste
    const doctorPatient = await prisma.doctorPatient.findFirst({
      include: {
        patient: true,
        doctor: true
      }
    })

    if (!doctorPatient) {
      console.log('❌ Nenhuma relação doctor-patient encontrada. Execute o seed primeiro.')
      return
    }

    console.log(`✅ Encontrado: ${doctorPatient.patient.name} - Dr. ${doctorPatient.doctor.firstName}`)

    // 2. Buscar procedimentos disponíveis
    const procedures = await prisma.procedure.findMany({
      take: 3
    })

    if (procedures.length === 0) {
      console.log('❌ Nenhum procedimento encontrado. Execute o seed primeiro.')
      return
    }

    console.log(`✅ ${procedures.length} procedimentos encontrados`)

    // 3. Criar uma consulta com procedimentos dentais
    const appointment = await prisma.appointment.create({
      data: {
        doctorPatientId: doctorPatient.id,
        userId: doctorPatient.doctorId,
        tenantId: doctorPatient.tenantId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
        duration: 60,
        type: 'Consulta com Procedimentos',
        status: 'SCHEDULED',
        notes: 'Consulta de teste para validar procedimentos dentais'
      }
    })

    console.log(`✅ Consulta criada: ${appointment.id}`)

    // 4. Adicionar procedimentos para diferentes dentes
    const teethProcedures = [
      {
        doctorPatientId: doctorPatient.id,
        appointmentId: appointment.id,
        procedureId: procedures[0].id,
        toothNumberSite: 11,
        toothNumberFDI: '11',
        treatmentType: procedures[0].name,
        notes: 'Teste dente 11',
        status: 'PENDING'
      },
      {
        doctorPatientId: doctorPatient.id,
        appointmentId: appointment.id,
        procedureId: procedures[1]?.id || procedures[0].id,
        toothNumberSite: 21,
        toothNumberFDI: '21',
        treatmentType: procedures[1]?.name || procedures[0].name,
        notes: 'Teste dente 21',
        status: 'PENDING'
      },
      {
        doctorPatientId: doctorPatient.id,
        appointmentId: appointment.id,
        procedureId: procedures[2]?.id || procedures[0].id,
        toothNumberSite: 36,
        toothNumberFDI: '36',
        treatmentType: procedures[2]?.name || procedures[0].name,
        notes: 'Teste dente 36 - molar inferior',
        status: 'PENDING'
      }
    ]

    for (const toothData of teethProcedures) {
      await prisma.patientTeeth.create({ data: toothData })
    }

    console.log(`✅ ${teethProcedures.length} procedimentos dentais adicionados`)

    // 5. Verificar se os dados foram salvos corretamente
    const appointmentWithTeeth = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        doctorPatient: {
          include: {
            patient: true
          }
        },
        user: true,
        teeth: {
          include: {
            procedure: true
          }
        }
      }
    })

    console.log('📋 Consulta com procedimentos:')
    console.log(`   Paciente: ${appointmentWithTeeth.doctorPatient.patient.name}`)
    console.log(`   Data: ${appointmentWithTeeth.date.toLocaleDateString('pt-BR')}`)
    console.log(`   Tipo: ${appointmentWithTeeth.type}`)
    console.log(`   Dentes: ${appointmentWithTeeth.teeth.length}`)
    
    appointmentWithTeeth.teeth.forEach((tooth, index) => {
      console.log(`     ${index + 1}. Dente ${tooth.toothNumberFDI} - ${tooth.treatmentType}`)
      if (tooth.notes) {
        console.log(`        Obs: ${tooth.notes}`)
      }
    })

    console.log('\n🎉 Teste concluído com sucesso!')
    console.log('\n📝 Para testar no frontend:')
    console.log('1. Acesse o calendário')
    console.log('2. Clique na consulta criada para ver os detalhes com procedimentos')
    console.log('3. Crie uma nova consulta e teste a seleção de dentes')
    console.log('4. Configure procedimentos específicos por dente')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDentalFunctionality()
