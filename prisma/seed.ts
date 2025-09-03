import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 🏢 Create sample tenant (Clínica Silva)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-silva' },
    update: {},
    create: {
      name: 'Clínica Odontológica Silva',
      slug: 'clinica-silva',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123 - Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05432-000',
      phone: '(11) 3456-7890',
      whatsapp: '(11) 99999-0000',
      email: 'contato@clinicasilva.com.br',
      website: 'www.clinicasilva.com.br',
      description: 'Cuidando do seu sorriso há mais de 10 anos',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Tenant created:', tenant.name)

  // 👨‍⚕️ Create sample doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'dr.joao@clinicasilva.com.br' },
    update: {},
    create: {
      email: 'dr.joao@clinicasilva.com.br',
      firstName: 'João',
      lastName: 'Silva',
      phone: '(11) 99999-9999',
      role: 'OWNER',
      cro: 'CRO-SP 12345',
      specialties: ['Clínico Geral', 'Ortodontia'],
      tenantId: tenant.id,
    },
  })

  console.log('✅ Doctor created:', doctor.firstName, doctor.lastName)

  // ⚙️ Create tenant settings
  const settings = await prisma.tenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHoursStart: '08:00',
      workingHoursEnd: '18:00',
      lunchBreakStart: '12:00',
      lunchBreakEnd: '13:00',
      defaultDuration: 30,
      slotInterval: 15,
      advanceBookingDays: 30,
      allowOnlineBooking: true,
      whatsappEnabled: true,
      whatsappNumber: '(11) 99999-0000',
      autoReplyEnabled: true,
      welcomeMessage: 'Olá! Aqui é o atendimento automático do Dr. João Silva. Como posso ajudar?',
      outOfHoursMessage: 'Obrigado pela mensagem! Nosso horário de atendimento é de 8h às 18h, de segunda a sexta. Retornaremos seu contato no próximo dia útil.',
      reminderEnabled: true,
      reminderHoursBefore: 24,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
  })

  console.log('✅ Settings created for tenant')

  // 👤 Create sample patients
  const patients = [
    {
      name: 'Maria Silva Santos',
      phone: '(11) 99999-1111',
      birthDate: new Date('1985-03-15'),
      gender: 'FEMALE' as const,
      cpf: '123.456.789-00',
      contactSource: 'WHATSAPP' as const,
      whatsappId: 'wa_maria_silva',
    },
    {
      name: 'João Santos Lima',
      phone: '(11) 99999-2222',
      birthDate: new Date('1990-07-22'),
      gender: 'MALE' as const,
      cpf: '987.654.321-00',
      contactSource: 'MANUAL' as const,
    },
    {
      name: 'Ana Costa Ferreira',
      phone: '(11) 99999-3333',
      birthDate: new Date('1978-11-05'),
      gender: 'FEMALE' as const,
      cpf: '456.789.123-00',
      contactSource: 'WEBSITE' as const,
    },
  ]

  for (const patientData of patients) {
    const patient = await prisma.patient.upsert({
      where: {
        phone: patientData.phone
      },
      update: {},
      create: {
        ...patientData,
      },
    })
    console.log('✅ Patient created:', patient.name)
  }

  // 🏥 Create doctor-patient relationships
  const allPatients = await prisma.patient.findMany({})
  const doctorPatients = []
  
  const doctorPatientData = [
    {
      notes: 'Paciente com histórico de sensibilidade dental'
    },
    {
      notes: 'Paciente pontual, sem restrições'
    },
    {
      notes: 'Paciente com plano odontológico Bradesco'
    },
  ]
  
  for (let i = 0; i < allPatients.length; i++) {
    const patient = allPatients[i]
    const extraData = doctorPatientData[i]
    
    const doctorPatient = await prisma.doctorPatient.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        tenantId: tenant.id,
        ...extraData
      }
    })
    doctorPatients.push(doctorPatient)
    console.log('✅ Doctor-patient relationship created for:', patient.name)
  }
  
  // 📅 Create sample appointments
  
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const appointments = [
    {
      date: new Date(today.setHours(9, 0, 0, 0)),
      duration: 30,
      status: 'CONFIRMED' as const,
      type: 'Consulta',
      notes: 'Consulta de rotina',
      doctorPatientId: doctorPatients[0].id,
    },
    {
      date: new Date(today.setHours(9, 30, 0, 0)),
      duration: 60,
      status: 'SCHEDULED' as const,
      type: 'Limpeza',
      notes: 'Limpeza dental completa',
      doctorPatientId: doctorPatients[1].id,
    },
    {
      date: new Date(today.setHours(14, 0, 0, 0)),
      duration: 45,
      status: 'CONFIRMED' as const,
      type: 'Extração',
      notes: 'Extração de dente do siso',
      doctorPatientId: doctorPatients[2].id,
    },
  ]

  for (const appointmentData of appointments) {
    const appointment = await prisma.appointment.create({
      data: {
        ...appointmentData,
        tenantId: tenant.id,
        userId: doctor.id,
      },
    })
    console.log('✅ Appointment created for:', appointmentData.date)
  }

  // 📝 Create message templates
  const templates = [
    {
      name: 'Boas-vindas',
      content: 'Olá {nome}! Bem-vindo à Clínica Silva. Como posso ajudar?',
      category: 'WELCOME' as const,
    },
    {
      name: 'Confirmação de Consulta',
      content: '✅ Consulta confirmada!\n📅 {data}\n⏰ {horario}\n👨‍⚕️ {doutor}',
      category: 'APPOINTMENT_CONFIRMATION' as const,
    },
    {
      name: 'Lembrete de Consulta',
      content: '🔔 Lembrete: Você tem consulta amanhã às {horario} com {doutor}. Confirma sua presença?',
      category: 'APPOINTMENT_REMINDER' as const,
    },
  ]

  for (const templateData of templates) {
    await prisma.messageTemplate.create({
      data: {
        ...templateData,
        tenantId: tenant.id,
      },
    })
    console.log('✅ Template created:', templateData.name)
  }

  // 💳 Create subscription
  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      amount: 197.00,
      currency: 'BRL',
      billingCycle: 'MONTHLY',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })

  console.log('✅ Subscription created')

  // 🏥 Create sample clinics
  const clinic1 = await prisma.clinic.create({
    data: {
      name: 'Consultório Central',
      address: 'Rua das Flores, 123 - Vila Madalena, São Paulo, SP',
      phone: '(11) 3456-7890',
      email: 'central@clinicasilva.com.br',
      description: 'Consultório principal da clínica'
    }
  })

  const clinic2 = await prisma.clinic.create({
    data: {
      name: 'Filial Shopping',
      address: 'Shopping Center, Loja 45 - Morumbi, São Paulo, SP',
      phone: '(11) 3456-7891',
      email: 'shopping@clinicasilva.com.br',
      description: 'Filial localizada no shopping'
    }
  })

  console.log('✅ Clinics created:', clinic1.name, 'and', clinic2.name)

  // Associate doctor with clinics
  await prisma.doctorClinic.createMany({
    data: [
      {
        doctorId: doctor.id,
        clinicId: clinic1.id
      },
      {
        doctorId: doctor.id,
        clinicId: clinic2.id
      }
    ]
  })

  console.log('✅ Doctor associated with clinics')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })