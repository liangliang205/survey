import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const deleted = searchParams.get('deleted') === 'true'

  const where = deleted ? { deletedAt: { not: null } } : { deletedAt: null }

  const surveys = await prisma.survey.findMany({
    where,
    include: {
      _count: {
        select: { submissions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(surveys)
}