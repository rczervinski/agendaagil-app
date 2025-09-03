import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const procedures = await prisma.procedure.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('Error fetching procedures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch procedures' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.tenantId || !data.name || !data.duration) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, name, duration' },
        { status: 400 }
      )
    }

    // Validate duration is a positive number
    if (data.duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive number' },
        { status: 400 }
      )
    }

    // Check if procedure name already exists for this tenant
    const existingProcedure = await prisma.procedure.findFirst({
      where: {
        tenantId: data.tenantId,
        name: data.name,
        isActive: true
      }
    })

    if (existingProcedure) {
      return NextResponse.json(
        { error: 'Procedure with this name already exists' },
        { status: 409 }
      )
    }

    const procedure = await prisma.procedure.create({
      data: {
        name: data.name,
        description: data.description || null,
        duration: parseInt(data.duration),
        price: data.price ? parseFloat(data.price) : null,
        tenantId: data.tenantId
      }
    })

    return NextResponse.json(procedure, { status: 201 })
  } catch (error) {
    console.error('Error creating procedure:', error)
    return NextResponse.json(
      { error: 'Failed to create procedure' },
      { status: 500 }
    )
  }
}