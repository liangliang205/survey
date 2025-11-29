'use server'

import { SaveSurveyDto } from '@/lib/parse-survey-dto'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'

export async function saveSurvey(formData: FormData) {
  try {
    // 1. 将 FormData 解析为普通对象（保留文件 Base64）
    const dto = Object.fromEntries(formData.entries()) as any

    // 2. 将题目数组反序列化
    dto.questions = dto.questions ? JSON.parse(dto.questions as string) : []
    dto.isActive = dto.isActive === 'true'

    // 3. zod 校验
    const body = SaveSurveyDto.parse(dto)

    // 4. 事务级联写入
    const survey = await prisma.survey.upsert({
      where: { id: body.id || '' },
      update: {
        title: body.title,
        description: body.description,
        isActive: body.isActive,
        bgImage: body.bgImage || null,
      },
      create: {
        title: body.title,
        description: body.description || '',
        isActive: body.isActive,
        bgImage: body.bgImage || null,
      },
    })

    // 题目先清空再重建：简单对称策略
    await prisma.question.deleteMany({ where: { surveyId: survey.id } })

    // 级联插入
    for (const q of body.questions) {
      const question = await prisma.question.create({
        data: {
          surveyId: survey.id,
          title: q.title,
          type: q.type,
          order: q.order,
          required: q.required,
          placeholder: q.placeholder || null,
        },
      })

      if (q.options?.length) {
        await prisma.option.createMany({
          data: q.options.map((opt) => ({
            questionId: question.id,
            label: opt.label,
            value: opt.value,
            order: opt.order,
          })),
        })
      }
    }

    revalidatePath('/admin')
    return { success: true, data: survey }
  } catch (e) {
    console.error(e)
    return { success: false, error: (e as Error).message }
  }
}
