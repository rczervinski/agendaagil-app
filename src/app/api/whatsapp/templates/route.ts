import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    })

    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      content: template.content,
      category: template.category,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    }))

    return NextResponse.json(formattedTemplates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.content || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, content, category' },
        { status: 400 }
      )
    }

    const template = await prisma.messageTemplate.create({
      data: {
        name: data.name,
        content: data.content,
        category: data.category,
        tenantId: data.tenantId || 'default-tenant-id', // TODO: Get from session
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })

    const formattedTemplate = {
      id: template.id,
      name: template.name,
      content: template.content,
      category: template.category,
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
