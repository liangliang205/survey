import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  _: Request,
  { params }: { params: { surveyId: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const survey = await prisma.survey.findUnique({
      where: { id: params.surveyId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
        userInfoFields: {
          orderBy: { order: 'asc' }
        }
      },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('获取问卷详情失败:', error)
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 })
  }
}