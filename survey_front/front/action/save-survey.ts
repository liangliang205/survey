'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Survey } from '@prisma/client'

export async function saveSurvey(id: string | null, data: any) {
  const session = await auth()
  if (!session) {
    return { success: false, error: '未授权' }
  }
  try {
    let survey: Survey
    if (id) {
      // 更新问卷（保留问题与选项的ID，进行差异化更新）
      // 更新问卷（保留问题与选项的ID，进行差异化更新）
      survey = await prisma.survey.update({
        where: { id },
        data: {
          title: data.title,
          bgImage: data.bgImage,
          bgImageCover: data.bgImageCover,
          bgImageQuestions: data.bgImageQuestions,
          bgImageThanks: data.bgImageThanks,
          supportCardImage: data.supportCardImage,
          supportButtonText: data.supportButtonText,
          supportButtonUrl: data.supportButtonUrl,
          redirectUrl: data.redirectUrl,
          isActive: data.isActive,
          updatedAt: new Date(),
          // 用户信息字段仍采用清空重建策略（标题变化会影响历史数据映射）
          userInfoFields: {
            deleteMany: {}
          },
        },
      })

      // 重建用户信息字段
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

      // 读取现有问题与选项
      const existingQuestions = await prisma.question.findMany({
        where: { surveyId: survey.id },
        include: { options: true },
        orderBy: { order: 'asc' }
      })
      const existingQuestionMap = new Map(existingQuestions.map(q => [q.id, q]))

      const incomingQuestions: any[] = Array.isArray(data.questions) ? data.questions : []
      const incomingIds = new Set(
        incomingQuestions.filter((q) => !!q.id).map((q) => q.id as string)
      )

      // 删除已移除的问题（及其选项将因外键级联一并删除）
      const toDeleteIds = existingQuestions
        .filter(q => !incomingIds.has(q.id))
        .map(q => q.id)
      if (toDeleteIds.length > 0) {
        await prisma.question.deleteMany({ where: { id: { in: toDeleteIds }, surveyId: survey.id } })
      }

      // 更新或创建问题与选项
      for (const q of incomingQuestions) {
        if (q.id && existingQuestionMap.has(q.id)) {
          // 更新问题基本信息
          await prisma.question.update({
            where: { id: q.id },
            data: {
              title: q.title,
              type: q.type,
              order: q.order,
              required: q.required,
              placeholder: q.placeholder,
            }
          })

          // 同步选项
          const oldQ = existingQuestionMap.get(q.id)!
          const oldOptions = oldQ.options
          const oldOptMap = new Map(oldOptions.map(o => [o.id, o]))
          const incomingOpts: any[] = Array.isArray(q.options) ? q.options : []
          const incomingOptIds = new Set(incomingOpts.filter(o => !!o.id).map(o => o.id as string))

          // 删除移除的选项
          const toDeleteOptIds = oldOptions
            .filter(o => !incomingOptIds.has(o.id))
            .map(o => o.id)
          if (toDeleteOptIds.length > 0) {
            await prisma.option.deleteMany({ where: { id: { in: toDeleteOptIds }, questionId: q.id } })
          }

          // 更新或创建选项
          for (let i = 0; i < incomingOpts.length; i++) {
            const opt = incomingOpts[i]
            const order = typeof opt.order === 'number' ? opt.order : i
            if (opt.id && oldOptMap.has(opt.id)) {
              await prisma.option.update({
                where: { id: opt.id },
                data: { value: opt.value, order }
              })
            } else {
              await prisma.option.create({
                data: { questionId: q.id, value: opt.value, order }
              })
            }
          }
        } else {
          // 创建新问题
          await prisma.question.create({
            data: {
              surveyId: survey.id,
              title: q.title,
              type: q.type,
              order: q.order,
              required: q.required,
              placeholder: q.placeholder,
              options: Array.isArray(q.options) && q.options.length > 0
                ? { create: q.options.map((opt: any, idx: number) => ({ value: opt.value, order: typeof opt.order === 'number' ? opt.order : idx })) }
                : undefined,
            }
          })
        }
      }
    } else {
      // 验证 Admin 是否存在
      const adminExists = await prisma.admin.findUnique({
        where: { id: session.user.id }
      })

      if (!adminExists) {
        return { success: false, error: '用户不存在，请重新登录' }
      }

      // 创建新问卷
      survey = await prisma.survey.create({
        data: {
          title: data.title,
          bgImage: data.bgImage,
          bgImageCover: data.bgImageCover,
          bgImageQuestions: data.bgImageQuestions,
          bgImageThanks: data.bgImageThanks,
          supportCardImage: data.supportCardImage,
          supportButtonText: data.supportButtonText,
          supportButtonUrl: data.supportButtonUrl,
          redirectUrl: data.redirectUrl,
          isActive: data.isActive,
          admin: {
            connect: {
              id: session.user.id
            }
          }
        },
      })
      // 新建问卷：创建用户信息字段
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

      // 新建问卷：创建问题与选项
      for (const question of data.questions) {
        await prisma.question.create({
          data: {
            surveyId: survey.id,
            title: question.title,
            type: question.type,
            order: question.order,
            required: question.required,
            placeholder: question.placeholder,
            options: question.options && question.options.length > 0
              ? {
                  create: question.options.map((opt: any, optIndex: number) => ({
                    value: opt.value,
                    order: typeof opt.order === 'number' ? opt.order : optIndex,
                  })),
                }
              : undefined,
          },
        })
      }
    }

    revalidatePath('/admin')
    return { success: true, data: survey }
  } catch (error) {
    console.error('保存问卷失败:', error)
    return { success: false, error: '保存失败' }
  }
}