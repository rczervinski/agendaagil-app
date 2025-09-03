import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar configurações do tenant
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = params

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId }
    })

    if (!settings) {
      // Retornar configurações padrão se não existir
      return NextResponse.json({
        toothNumberingSystem: 'FDI'
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erro ao buscar configurações do tenant:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar configurações do tenant
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = params
    const data = await request.json()

    // Verificar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar ou criar configurações
    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: data,
      create: {
        tenantId,
        ...data
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erro ao atualizar configurações do tenant:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
