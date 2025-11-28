import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SurveyClient from './survey-client'
import { SurveyProvider } from '@/components/survey/survey-context'

export const revalidate = 0 // 动态渲染

interface Props {
  params: { id: string }
}

export default async function SurveyPage({ params }: Props) {
  const survey = await prisma.survey.findUnique({
    where: { id: params.id, isActive: true },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!survey) {
    notFound()
  }

  return (
    <SurveyProvider survey={survey}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <SurveyClient />
      </div>
    </SurveyProvider>
  )
}