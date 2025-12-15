import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(admins)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // @ts-ignore
  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { username, password, name } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const existing = await prisma.admin.findUnique({
      where: { username },
    })

    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json(admin)
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
