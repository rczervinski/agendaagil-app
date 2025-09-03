import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { universalToFDI } from '@/components/dental/utils/toothMapping'

// GET - Buscar histórico completo da arca dentária
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const doctorPatientId = id

    // Verificar se a relação doutor-paciente existe
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId },
      include: {
        patient: {
          select: { name: true }
        },
        doctor: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Relação doutor-paciente não encontrada' },
        { status: 404 }
      )
    }

    // Buscar todos os registros de dentes para este paciente
    const teeth = await prisma.patientTeeth.findMany({
      where: {
        doctorPatientId: doctorPatientId
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Estatísticas da arca dentária
    const totalProcedures = teeth.length
    const treatedTeeth = new Set(teeth.map(t => t.toothNumberSite)).size
    const extractedTeeth = teeth.filter(t => t.status === 'EXTRACTED').length
    const pendingTreatments = teeth.filter(t => t.status === 'PENDING').length

    const response = {
      doctorPatientId,
      patientName: doctorPatient.patient.name,
      doctorName: `${doctorPatient.doctor.firstName} ${doctorPatient.doctor.lastName}`,
      teeth,
      totalProcedures,
      stats: {
        totalTeeth: 32,
        treatedTeeth,
        extractedTeeth,
        pendingTreatments,
        lastUpdate: teeth[0]?.updatedAt || null
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar arca dentária:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Registrar novo procedimento em dente(s)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const doctorPatientId = id
    const body = await request.json()
    
    const {
      toothNumbers,
      procedureId,
      treatmentType,
      notes,
      appointmentId
    } = body

    // Validações
    if (!toothNumbers || !Array.isArray(toothNumbers) || toothNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Números dos dentes são obrigatórios' },
        { status: 400 }
      )
    }

    if (!treatmentType) {
      return NextResponse.json(
        { error: 'Tipo de tratamento é obrigatório' },
        { status: 400 }
      )
    }

    // Validar numeração dos dentes (1-32)
    const invalidTeeth = toothNumbers.filter((num: number) => num < 1 || num > 32)
    if (invalidTeeth.length > 0) {
      return NextResponse.json(
        { error: `Números de dentes inválidos: ${invalidTeeth.join(', ')}` },
        { status: 400 }
      )
    }

    // Verificar se a relação doutor-paciente existe
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Relação doutor-paciente não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o procedimento existe (se fornecido)
    if (procedureId) {
      const procedure = await prisma.procedure.findUnique({
        where: { id: procedureId }
      })

      if (!procedure) {
        return NextResponse.json(
          { error: 'Procedimento não encontrado' },
          { status: 404 }
        )
      }
    }

    // Verificar se a consulta existe (se fornecido)
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      })

      if (!appointment) {
        return NextResponse.json(
          { error: 'Consulta não encontrada' },
          { status: 404 }
        )
      }
    }

    // Criar registros para cada dente
    const createPromises = toothNumbers.map((toothNumber: number) => {
      return prisma.patientTeeth.create({
        data: {
          doctorPatientId,
          appointmentId: appointmentId || null,
          procedureId: procedureId || null,
          toothNumberSite: toothNumber,
          toothNumberFDI: universalToFDI(toothNumber),
          treatmentType,
          notes: notes || null,
          status: 'ACTIVE'
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
    })

    const createdRecords = await Promise.all(createPromises)

    return NextResponse.json({
      message: 'Procedimentos registrados com sucesso',
      records: createdRecords,
      count: createdRecords.length
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar registros dentários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}