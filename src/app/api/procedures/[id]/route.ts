import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const procedure = await prisma.procedure.findUnique({
      where: { id }
    })

    if (!procedure) {
      return NextResponse.json(
        { error: 'Procedure not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(procedure)
  } catch (error) {
    console.error('Error fetching procedure:', error)
    return NextResponse.json(
      { error: 'Failed to fetch procedure' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const data = await request.json()

    // Check if procedure exists
    const existingProcedure = await prisma.procedure.findUnique({
      where: { id }
    })

    if (!existingProcedure) {
      return NextResponse.json(
        { error: 'Procedure not found' },
        { status: 404 }
      )
    }

    // Validate duration if provided
    if (data.duration !== undefined && data.duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive number' },
        { status: 400 }
      )
    }

    // Check if new name conflicts with existing procedures
    if (data.name && data.name !== existingProcedure.name) {
      const nameConflict = await prisma.procedure.findFirst({
        where: {
          tenantId: existingProcedure.tenantId,
          name: data.name,
          isActive: true,
          id: { not: id }
        }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Procedure with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.duration !== undefined) updateData.duration = parseInt(data.duration)
    if (data.price !== undefined) updateData.price = data.price ? parseFloat(data.price) : null
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const updatedProcedure = await prisma.procedure.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedProcedure)
  } catch (error) {
    console.error('Error updating procedure:', error)
    return NextResponse.json(
      { error: 'Failed to update procedure' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if procedure exists
    const existingProcedure = await prisma.procedure.findUnique({
      where: { id }
    })

    if (!existingProcedure) {
      return NextResponse.json(
        { error: 'Procedure not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    const deletedProcedure = await prisma.procedure.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Procedure deleted successfully' })
  } catch (error) {
    console.error('Error deleting procedure:', error)
    return NextResponse.json(
      { error: 'Failed to delete procedure' },
      { status: 500 }
    )
  }
}