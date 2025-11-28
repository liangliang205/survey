'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SubmitSchema = z.object({
  surveyId: z.string(),
  userInfo: z.string(),
  answers: z.string(),
})

export async function submitSurvey(formData: FormData) {
  try {
    const data = SubmitSchema.parse({
      surveyId: formData.get('surveyId'),
      userInfo: formData.get('userInfo'),
      answers: formData.get('answers'),
    })

    const userInfo = JSON.parse(data.userInfo)
    const answers = JSON.parse(data.answers)

    // 创建提交记录
    const submission = await prisma.submission.create({
      data: {
        surveyId: data.surveyId,
        userInfo: JSON.stringify(userInfo),
        answers: {
          create: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value: Array.isArray(value) ? JSON.stringify(value) : String(value),
          })),
        },
      },
    })

    revalidatePath(`/admin/surveys/${data.surveyId}/data`)
    
    return { success: true, submissionId: submission.id }
  } catch (error) {
    console.error('提交失败:', error)
    throw new Error('问卷提交失败，请稍后重试')
  }
}