import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Get messages for this patient
    const messages = await prisma.whatsAppMessage.findMany({
      where: {
        patientId: patientId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        sentAt: 'asc',
      },
      take: limit,
      skip: offset,
    })

    const formattedMessages = messages.map(message => ({
      id: message.id,
      messageId: message.messageId,
      sender: message.direction === 'INBOUND' ? 'patient' : 
              message.direction === 'OUTBOUND' && message.user ? 'user' : 'bot',
      content: message.content,
      type: message.type,
      status: message.status,
      timestamp: formatMessageTimestamp(message.sentAt),
      sentAt: message.sentAt.toISOString(),
      user: message.user ? {
        name: `${message.user.firstName} ${message.user.lastName}`,
      } : null,
    }))

    // Mark inbound messages as read
    await prisma.whatsAppMessage.updateMany({
      where: {
        patientId: patientId,
        direction: 'INBOUND',
        status: {
          not: 'READ',
        },
      },
      data: {
        status: 'READ',
      },
    })

    return NextResponse.json({
      messages: formattedMessages,
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        whatsappId: patient.whatsappId,
      },
      total: messages.length,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params
    const data = await request.json()
    
    // Validate required fields
    if (!data.content) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      )
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Create the message
    const message = await prisma.whatsAppMessage.create({
      data: {
        content: data.content,
        direction: data.direction || 'OUTBOUND',
        type: data.type || 'TEXT',
        status: data.status || 'SENT',
        tenantId: data.tenantId || 'default-tenant-id', // Should be passed from client
        patientId: patientId,
        userId: data.userId, // Optional - if sent by a specific user
        messageId: data.messageId, // WhatsApp message ID if available
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Update patient's last contact
    await prisma.patient.update({
      where: { id: patientId },
      data: { lastContact: new Date() }
    })

    const formattedMessage = {
      id: message.id,
      messageId: message.messageId,
      sender: message.direction === 'INBOUND' ? 'patient' : 
              message.direction === 'OUTBOUND' && message.user ? 'user' : 'bot',
      content: message.content,
      type: message.type,
      status: message.status,
      timestamp: formatMessageTimestamp(message.sentAt),
      sentAt: message.sentAt.toISOString(),
      user: message.user ? {
        name: `${message.user.firstName} ${message.user.lastName}`,
      } : null,
    }

    return NextResponse.json(formattedMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

function formatMessageTimestamp(date: Date): string {
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffInHours < 48) {
    return `Ontem ${date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
