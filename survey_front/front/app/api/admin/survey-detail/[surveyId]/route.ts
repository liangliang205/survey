import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  req: any,
  { params }: { params: { surveyId: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const survey = await prisma.survey.findUnique({
    where: { id: params.surveyId },
    include: {
      questions: { orderBy: { order: 'asc' }, include: { options: true } },
    },
  })
  if (!survey) return NextResponse.json({ error: 'not-found' }, { status: 404 })
  return NextResponse.json(survey)
}
