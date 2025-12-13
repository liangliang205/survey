'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const UserInfoSchema = z.object({
  surveyId: z.string(),
  userInfo: z.string(),
})

export async function submitUserInfo(formData: FormData) {
  try {
    const data = UserInfoSchema.parse({
      surveyId: formData.get('surveyId'),
      userInfo: formData.get('userInfo'),
    })

    const userInfo = JSON.parse(data.userInfo)

    // 创建提交记录，只包含用户信息
    const submission = await prisma.submission.create({
      data: {
        surveyId: data.surveyId,
        userInfo: JSON.stringify(userInfo),
      },
    })

    return { success: true, submissionId: submission.id }
  } catch (error) {
    console.error('提交用户信息失败:', error)
    throw new Error('提交用户信息失败，请稍后重试')
  }
}

const AnswersSchema = z.object({
  submissionId: z.string(),
  answers: z.string(),
  surveyId: z.string(), // 用于 revalidatePath
})

export async function submitAnswers(formData: FormData) {
  try {
    const data = AnswersSchema.parse({
      submissionId: formData.get('submissionId'),
      answers: formData.get('answers'),
      surveyId: formData.get('surveyId'),
    })

    const answers = JSON.parse(data.answers)

    // 更新提交记录，添加答案
    await prisma.submission.update({
      where: { id: data.submissionId },
      data: {
        answers: {
          create: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value: Array.isArray(value) ? JSON.stringify(value) : String(value),
          })),
        },
      },
    })

    revalidatePath(`/admin/surveys/${data.surveyId}/data`)
    
    return { success: true }
  } catch (error) {
    console.error('提交答案失败:', error)
    throw new Error('提交答案失败，请稍后重试')
  }
}

// 保留旧的 submitSurvey 以防万一，或者直接删除。
// 既然我重写了整个文件，我就不保留旧的了，因为逻辑变了。
