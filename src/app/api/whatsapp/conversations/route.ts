import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get patients with recent WhatsApp messages
    const conversations = await prisma.patient.findMany({
      where: {
        messages: {
          some: {}, // Has at least one message
        },
        isActive: true,
      },
      include: {
        messages: {
          orderBy: {
            sentAt: 'desc',
          },
          take: 1, // Get only the latest message for preview
        },
        _count: {
          select: {
            messages: {
              where: {
                direction: 'INBOUND',
                status: {
                  not: 'READ',
                },
              },
            },
          },
        },
      },
      orderBy: {
        lastContact: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const formattedConversations = conversations.map(patient => {
      const lastMessage = patient.messages[0]
      const initials = patient.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return {
        id: patient.id,
        patientName: patient.name,
        phone: patient.phone,
        avatar: initials,
        lastMessage: lastMessage?.content || 'No messages',
        timestamp: lastMessage?.sentAt 
          ? formatTimestamp(lastMessage.sentAt)
          : 'Never',
        unreadCount: patient._count.messages,
        isOnline: patient.lastContact 
          ? isRecentlyActive(patient.lastContact)
          : false,
        whatsappId: patient.whatsappId,
      }
    })

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffInHours < 48) {
    return 'Ontem'
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }
}

function isRecentlyActive(lastContact: Date): boolean {
  const now = new Date()
  const diffInMinutes = (now.getTime() - lastContact.getTime()) / (1000 * 60)
  return diffInMinutes < 5 // Consider online if active in last 5 minutes
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.patientId || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, content' },
        { status: 400 }
      )
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId }
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
        patientId: data.patientId,
        userId: data.userId, // Optional - if sent by a specific user
        messageId: data.messageId, // WhatsApp message ID if available
      },
    })

    // Update patient's last contact
    await prisma.patient.update({
      where: { id: data.patientId },
      data: { lastContact: new Date() }
    })

    const formattedMessage = {
      id: message.id,
      messageId: message.messageId,
      direction: message.direction,
      content: message.content,
      type: message.type,
      status: message.status,
      sentAt: message.sentAt.toISOString(),
      createdAt: message.createdAt.toISOString(),
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
