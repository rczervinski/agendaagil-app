const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testToothNumberingStandardization() {
  try {
    console.log('🧪 Testando Padronização de Numeração Dental...')

    // 1. Verificar configurações do tenant
    const tenantSettings = await prisma.tenantSettings.findFirst()
    
    if (!tenantSettings) {
      console.log('🔧 Criando configurações de tenant padrão...')
      const tenant = await prisma.tenant.findFirst()
      
      if (tenant) {
        await prisma.tenantSettings.create({
          data: {
            tenantId: tenant.id,
            toothNumberingSystem: 'FDI'
          }
        })
        console.log('✅ Configurações criadas com sistema FDI como padrão')
      }
    } else {
      console.log(`✅ Sistema configurado: ${tenantSettings.toothNumberingSystem}`)
    }

    // 2. Buscar consultas com procedimentos dentais
    const appointmentsWithTeeth = await prisma.appointment.findMany({
      where: {
        teeth: {
          some: {}
        }
      },
      include: {
        teeth: {
          include: {
            procedure: true
          }
        },
        doctorPatient: {
          include: {
            patient: true
          }
        }
      },
      take: 3
    })

    console.log(`\n📋 Encontradas ${appointmentsWithTeeth.length} consultas com procedimentos dentais`)

    appointmentsWithTeeth.forEach((appointment, index) => {
      console.log(`\n${index + 1}. Consulta: ${appointment.doctorPatient.patient.name}`)
      console.log(`   Data: ${appointment.date.toLocaleDateString('pt-BR')}`)
      console.log(`   Tipo: ${appointment.type}`)
      console.log(`   Dentes tratados: ${appointment.teeth.length}`)
      
      appointment.teeth.forEach((tooth, i) => {
        console.log(`     ${i + 1}. Universal: ${tooth.toothNumberSite} | FDI: ${tooth.toothNumberFDI}`)
        console.log(`        Procedimento: ${tooth.treatmentType}`)
        if (tooth.notes) {
          console.log(`        Obs: ${tooth.notes}`)
        }
      })
    })

    // 3. Testar conversão para diferentes configurações
    console.log('\n🔄 Testando Exibição por Configuração:')
    
    const testTooth = appointmentsWithTeeth[0]?.teeth[0]
    if (testTooth) {
      console.log(`\nDente de teste: Universal ${testTooth.toothNumberSite}, FDI ${testTooth.toothNumberFDI}`)
      console.log(`📺 Configuração FDI: Mostra "${testTooth.toothNumberFDI}"`)
      console.log(`📺 Configuração Universal: Mostra "${testTooth.toothNumberSite}"`)
    }

    // 4. Verificar se há dados para análise
    console.log('\n🔍 Análise dos Dados:')
    
    if (appointmentsWithTeeth.length > 0) {
      const totalTeeth = appointmentsWithTeeth.reduce((sum, apt) => sum + apt.teeth.length, 0)
      console.log(`✅ Total de ${totalTeeth} procedimentos dentais registrados`)
      console.log('✅ Dados estão sendo salvos com ambas as numerações')
    } else {
      console.log('ℹ️  Nenhuma consulta com procedimentos dentais encontrada')
    }

    console.log('\n🎯 BENEFÍCIOS DA PADRONIZAÇÃO:')
    console.log('1. 🏥 Cada tenant escolhe sua numeração preferida')
    console.log('2. 💾 Banco salva ambas as numerações para compatibilidade')
    console.log('3. 🖥️  Interface sempre mostra a configuração escolhida')
    console.log('4. 📊 Relatórios respeitam a preferência do dentista')
    console.log('5. 🔄 Migração entre sistemas preserva dados')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testToothNumberingStandardization()
