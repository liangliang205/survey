import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// 批量更新问题（编辑器使用）
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { questions } = body

    // 先删除所有现有问题和选项
    // Answer 不支持通过 question 关系筛选，需先获取该问卷的所有问题ID
    const qIds = await prisma.question.findMany({
      where: { surveyId: params.id },
      select: { id: true },
    })
    await prisma.answer.deleteMany({
      where: {
        questionId: { in: qIds.map((q: { id: string }) => q.id) },
      },
    })
    await prisma.option.deleteMany({
      where: {
        question: {
          surveyId: params.id,
        },
      },
    })
    await prisma.question.deleteMany({
      where: { surveyId: params.id },
    })

    // 重新创建所有问题
    const createdQuestions = await Promise.all(
      questions.map(async (q: any, index: number) => {
        return prisma.question.create({
          data: {
            surveyId: params.id,
            title: q.title,
            type: q.type,
            order: index,
            required: q.required,
            placeholder: q.placeholder,
            options: {
              create: q.options.map((opt: any, optIndex: number) => ({
                value: opt.value,
                order: optIndex,
              })),
            },
          },
          include: { options: true },
        })
      })
    )

    return NextResponse.json({ success: true, questions: createdQuestions })
  } catch (error) {
    console.error('保存问题失败:', error)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}