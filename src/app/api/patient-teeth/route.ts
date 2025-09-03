import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar registros de dentes com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorPatientId = searchParams.get('doctorPatientId')
    const toothNumber = searchParams.get('toothNumber')
    const status = searchParams.get('status')

    if (!doctorPatientId) {
      return NextResponse.json(
        { error: 'doctorPatientId é obrigatório' },
        { status: 400 }
      )
    }

    const where: any = {
      doctorPatientId
    }

    if (toothNumber) {
      where.toothNumberSite = parseInt(toothNumber)
    }

    if (status) {
      where.status = status
    }

    const teeth = await prisma.patientTeeth.findMany({
      where,
      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            type: true,
            notes: true
          }
        },
        procedure: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(teeth)

  } catch (error) {
    console.error('Erro ao buscar registros de dentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}