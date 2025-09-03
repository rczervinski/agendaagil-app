import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar registro específico de dente
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const toothRecordId = id

    const toothRecord = await prisma.patientTeeth.findUnique({
      where: { id: toothRecordId },
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
        },
        doctorPatient: {
          include: {
            patient: {
              select: { name: true }
            },
            doctor: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    })

    if (!toothRecord) {
      return NextResponse.json(
        { error: 'Registro de dente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(toothRecord)

  } catch (error) {
    console.error('Erro ao buscar registro de dente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar registro de dente
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const toothRecordId = id
    const body = await request.json()
    
    const {
      treatmentType,
      notes,
      status
    } = body

    // Verificar se o registro existe
    const existingRecord = await prisma.patientTeeth.findUnique({
      where: { id: toothRecordId }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Registro de dente não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar registro
    const updatedRecord = await prisma.patientTeeth.update({
      where: { id: toothRecordId },
      data: {
        ...(treatmentType && { treatmentType }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
        updatedAt: new Date()
      },
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
      }
    })

    return NextResponse.json({
      message: 'Registro atualizado com sucesso',
      record: updatedRecord
    })

  } catch (error) {
    console.error('Erro ao atualizar registro de dente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover registro de dente
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const toothRecordId = id

    // Verificar se o registro existe
    const existingRecord = await prisma.patientTeeth.findUnique({
      where: { id: toothRecordId }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Registro de dente não encontrado' },
        { status: 404 }
      )
    }

    // Remover registro
    await prisma.patientTeeth.delete({
      where: { id: toothRecordId }
    })

    return NextResponse.json({
      message: 'Registro removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover registro de dente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}