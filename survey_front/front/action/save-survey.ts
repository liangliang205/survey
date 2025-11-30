'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function saveSurvey(id: string | null, data: any) {
  const session = await auth()
  if (!session) {
    return { success: false, error: '未授权' }
  }

  try {
    let survey
    if (id) {
      // 更新问卷
      survey = await prisma.survey.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          bgImage: data.bgImage,
          isActive: data.isActive,
          updatedAt: new Date(),
          // 删除现有的用户信息字段
          userInfoFields: {
            deleteMany: {}
          },
          // 删除现有问题和选项
          questions: {
            deleteMany: {}
          }
        },
      })
    } else {
      // 创建新问卷
      survey = await prisma.survey.create({
        data: {
          title: data.title,
          description: data.description,
          bgImage: data.bgImage,
          isActive: data.isActive,
          admin: {
            connect: {
              id: session.user.id
            }
          }
        },
      })
    }

    // 重新创建用户信息字段
    if (data.userInfoFields && data.userInfoFields.length > 0) {
      await prisma.userInfoField.createMany({
        data: data.userInfoFields.map((field: any) => ({
          surveyId: survey.id,
          title: field.title,
          type: field.type,
          required: field.required,
          order: field.order,
          placeholder: field.placeholder,
        }))
      })
    }

    // 重新创建问题
    for (const question of data.questions) {
      await prisma.question.create({
        data: {
          surveyId: survey.id,
          title: question.title,
          type: question.type,
          order: question.order,
          required: question.required,
          placeholder: question.placeholder,
          options: question.options
            ? {
                create: question.options.map((opt: any, optIndex: number) => ({
                  value: opt.value,
                  order: optIndex,
                })),
              }
            : undefined,
        },
      })
    }

    revalidatePath('/admin')
    return { success: true, data: survey }
  } catch (error) {
    console.error('保存问卷失败:', error)
    return { success: false, error: '保存失败' }
  }
}