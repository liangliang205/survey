'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SaveSurveySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  isActive: z.boolean(),
  bgImage: z.string().optional(),
})

export async function saveSurvey(formData: FormData) {
  try {
    const data = SaveSurveySchema.parse({
      id: formData.get('id') || undefined,
      title: formData.get('title'),
      description: formData.get('description') || '',
      isActive: formData.get('isActive') === 'true',
      bgImage: formData.get('bgImage') || null,
    })

    const survey = await prisma.survey.upsert({
      where: { id: data.id || '' },
      update: data,
      create: {
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        bgImage: data.bgImage,
      },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc'},
        },
      },
    })

    revalidatePath('/admin')
    return { success: true, data: survey }
  } catch (error) {
    console.error('保存失败:', error)
    throw new Error('问卷保存失败')
  }
}