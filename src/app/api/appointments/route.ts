import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatPhoneForDisplay } from '@/lib/phoneUtils'
import { canScheduleAppointment, ScheduleSettings } from '@/lib/timeSlots'
import { universalToFDI } from '@/components/dental/utils/toothMapping'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')

    const where: any = {}

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setDate(end.getDate() + 1) // Include the end date
      
      where.date = {
        gte: start,
        lt: end,
      }
    } else if (date) {
      // Filter by single date if provided (backward compatibility)
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.date = {
        gte: targetDate,
        lt: nextDay,
      }
    }

    // Filter by doctorPatient if provided
    if (patientId) {
      where.doctorPatient = {
        patientId: patientId
      }
    }

    // Filter by status if provided
    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctorPatient: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                phone: true,
                cpf: true,
                birthDate: true,
                gender: true,
                contactSource: true,
              }
            }
          }
        },
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        }
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Buscar dados dos dentes para cada consulta
    const appointmentIds = appointments.map(apt => apt.id)
    const teethData = appointmentIds.length > 0 ? await prisma.patientTeeth.findMany({
      where: {
        appointmentId: { in: appointmentIds }
      },
      include: {
        procedure: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
      },
    }) : []

    // Agrupar dentes por consulta
    const teethByAppointment = teethData.reduce((acc, tooth) => {
      const appointmentId = tooth.appointmentId
      if (appointmentId && !acc[appointmentId]) {
        acc[appointmentId] = []
      }
      if (appointmentId) {
        acc[appointmentId].push(tooth)
      }
      return acc
    }, {} as Record<string, any[]>)

    const formattedAppointments = appointments.map(appointment => {
      const patient = appointment.doctorPatient?.patient

      if (!patient) {
        console.warn(`Appointment ${appointment.id} has no patient data`)
        return null
      }

      const appointmentTeeth = teethByAppointment[appointment.id] || []

      return {
        id: appointment.id,
        date: appointment.date.toISOString(),
        time: appointment.date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        duration: appointment.duration,
        status: appointment.status,
        type: appointment.type,
        notes: appointment.notes,
        price: appointment.price,
        patient: {
          id: patient.id,
          name: patient.name,
          phone: formatPhoneForDisplay(patient.phone),
          cpf: patient.cpf,
          birthDate: patient.birthDate?.toISOString().split('T')[0],
          gender: patient.gender,
          contactSource: patient.contactSource,
          patientNotes: appointment.doctorPatient?.notes || null,
        },
        doctor: {
          id: appointment.user.id,
          name: `${appointment.user.firstName} ${appointment.user.lastName}`,
        },
        clinic: appointment.clinic,
        reminderSent: appointment.reminderSent,
        confirmationSent: appointment.confirmationSent,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
        teeth: appointmentTeeth.map(tooth => ({
          toothNumber: tooth.toothNumberSite,
          toothNumberFDI: tooth.toothNumberFDI,
          procedure: tooth.procedure?.name || tooth.treatmentType,
          notes: tooth.notes,
        })),
      }
    }).filter(Boolean) // Remove null entries

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    let doctorPatientId = data.doctorPatientId

    // If doctorPatientId is not provided, try to find/create it using patientName and patientPhone
    if (!doctorPatientId && data.patientName && data.patientPhone && data.userId && data.tenantId) {
      // First, find or create the global patient
      let patient = await prisma.patient.findUnique({
        where: { phone: data.patientPhone }
      })

      if (!patient) {
        // Create new global patient
        patient = await prisma.patient.create({
          data: {
            name: data.patientName,
            phone: data.patientPhone,
            contactSource: 'MANUAL',
          }
        })
      }

      // Find or create doctor-patient relationship
      let doctorPatient = await prisma.doctorPatient.findFirst({
        where: {
          patientId: patient.id,
          doctorId: data.userId,
          isActive: true
        }
      })

      if (!doctorPatient) {
        // Create doctor-patient relationship
        doctorPatient = await prisma.doctorPatient.create({
          data: {
            patientId: patient.id,
            doctorId: data.userId,
            tenantId: data.tenantId,
            isActive: true,
            notes: `Paciente adicionado via calendário em ${new Date().toLocaleDateString('pt-BR')}`
          }
        })
      }

      doctorPatientId = doctorPatient.id
    }

    // Validate required fields
    if (!doctorPatientId || !data.userId || !data.date) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorPatientId (or patientName/patientPhone), userId, date' },
        { status: 400 }
      )
    }

    // Check if doctor-patient relationship exists
    const doctorPatient = await prisma.doctorPatient.findUnique({
      where: { id: doctorPatientId },
      include: { patient: true }
    })

    if (!doctorPatient) {
      return NextResponse.json(
        { error: 'Doctor-patient relationship not found' },
        { status: 404 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate appointment time respects working hours
    const appointmentDate = new Date(data.date)
    const duration = data.duration || 30
    const endTime = new Date(appointmentDate.getTime() + duration * 60000)
    
    // Extract time from date for validation (format: HH:MM)
    const appointmentTime = appointmentDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    // Default schedule settings (these should ideally come from user/clinic settings)
    const scheduleSettings: ScheduleSettings = {
      workHours: {
        start: '08:00',
        end: '22:30'  // Updated to match calendar end time
      },
      lunchBreak: {
        start: '12:00',
        end: '13:00'
      },
      defaultDuration: 30,
      slotInterval: 15,
      enableLunchBreak: true
    }
    
    // Check if appointment can be scheduled within working hours
    if (!canScheduleAppointment(appointmentTime, duration, scheduleSettings)) {
      return NextResponse.json(
        { 
          error: 'Appointment cannot be scheduled at this time',
          details: `Appointment from ${appointmentTime} with ${duration} minutes duration would exceed working hours (${scheduleSettings.workHours.start} - ${scheduleSettings.workHours.end})`
        },
        { status: 400 }
      )
    }

    // Check for conflicting appointments with improved logic for multiple slots

    // Find any appointments that would conflict with this new appointment
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        userId: data.userId,
        status: {
          not: 'CANCELLED',
        },
        OR: [
          // Case 1: Existing appointment starts before new appointment ends
          // and ends after new appointment starts
          {
            AND: [
              {
                date: {
                  lt: endTime,
                },
              },
              {
                date: {
                  gte: new Date(appointmentDate.getTime() - 180 * 60000), // Check up to 3 hours before
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        date: true,
        duration: true,
      },
    })

    // Check each potentially conflicting appointment
    for (const existing of conflictingAppointments) {
      const existingStart = existing.date
      const existingEnd = new Date(existingStart.getTime() + existing.duration * 60000)

      // Check if there's actual overlap
      const hasOverlap = (
        (appointmentDate >= existingStart && appointmentDate < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (appointmentDate <= existingStart && endTime >= existingEnd)
      )

      if (hasOverlap) {
        return NextResponse.json(
          {
            error: 'Time slot is already booked',
            conflictingAppointment: {
              date: existingStart.toISOString(),
              duration: existing.duration
            }
          },
          { status: 409 }
        )
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        duration: data.duration || 30,
        status: data.status || 'SCHEDULED',
        type: data.type || 'consultation',
        notes: data.notes,
        price: data.price,
        tenantId: user.tenantId,
        userId: data.userId,
        doctorPatientId: doctorPatientId,
        clinicId: data.clinicId || null,
      },
      include: {
        doctorPatient: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Processar procedimentos por dente se fornecidos
    if (data.teethProcedures && Array.isArray(data.teethProcedures) && data.teethProcedures.length > 0) {
      const teethRecords = []
      
      for (const toothProc of data.teethProcedures) {
        // Garantir que temos ambas as numerações
        const universalNumber = toothProc.toothNumber
        const fdiNumber = toothProc.toothNumberFDI || universalToFDI(universalNumber)
        
        const teethRecord = await prisma.patientTeeth.create({
          data: {
            doctorPatientId: doctorPatientId,
            appointmentId: appointment.id,
            procedureId: toothProc.procedureId,
            toothNumberSite: universalNumber,
            toothNumberFDI: fdiNumber,
            treatmentType: toothProc.procedureName || 'Procedimento',
            notes: toothProc.notes || '',
            status: 'PENDING'
          }
        })
        teethRecords.push(teethRecord)
      }
      
      // Se há procedimentos específicos por dente, não usar o tipo genérico da consulta
      // Vamos calcular a duração total baseada nos procedimentos
      if (teethRecords.length > 0) {
        // Buscar informações dos procedimentos para calcular duração total
        const procedureIds = data.teethProcedures.map((tp: any) => tp.procedureId).filter(Boolean)
        if (procedureIds.length > 0) {
          const procedures = await prisma.procedure.findMany({
            where: { id: { in: procedureIds } },
            select: { duration: true }
          })
          
          const totalDuration = procedures.reduce((sum, proc) => sum + proc.duration, 0)
          
          // Atualizar a consulta com a duração total dos procedimentos
          if (totalDuration > 0) {
            await prisma.appointment.update({
              where: { id: appointment.id },
              data: { 
                duration: totalDuration,
                type: 'Múltiplos Procedimentos' // Indicar que são múltiplos procedimentos
              }
            })
            appointment.duration = totalDuration
            appointment.type = 'Múltiplos Procedimentos'
          }
        }
      }
    }

    const formattedAppointment = {
      id: appointment.id,
      date: appointment.date.toISOString(),
      time: appointment.date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration: appointment.duration,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes,
      price: appointment.price,
      patient: {
        id: appointment.doctorPatient.patient.id,
        name: appointment.doctorPatient.patient.name,
        phone: formatPhoneForDisplay(appointment.doctorPatient.patient.phone),
      },
      doctor: {
        id: appointment.user.id,
        name: `${appointment.user.firstName} ${appointment.user.lastName}`,
      },
      reminderSent: appointment.reminderSent,
      confirmationSent: appointment.confirmationSent,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedAppointment, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
