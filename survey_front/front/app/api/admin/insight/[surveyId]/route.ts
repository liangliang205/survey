import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  _: NextRequest,
  { params }: { params: { surveyId: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 保证问卷归属
  const survey = await prisma.survey.findFirst({
    where: { id: params.surveyId },
    include: {
      questions: { orderBy: { order: 'asc' }, include: { options: true } },
      submissions: {
        include: { answers: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!survey) return NextResponse.json({ error: 'not-found' }, { status: 404 })

  // 1. 总览数字
  const totalSubmissions = survey.submissions.length
  const dailyCount = survey.submissions.reduce(
    (acc, sub) => {
      const day = sub.createdAt.toISOString().slice(0, 10)
      acc[day] = (acc[day] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 2. 每题统计
  const questionStats = survey.questions.map((q) => {
    const answers = survey.submissions
      .flatMap((s) => s.answers.filter((a) => a.questionId === q.id))
      .map((a) => a.value)

    if (q.type === 'radio' || q.type === 'checkbox') {
      const counts: Record<string, number> = {}
      q.options.forEach((opt) => (counts[opt.label] = 0))

      answers.forEach((raw) => {
        try {
          const vals = JSON.parse(raw) // 多选
          ;(Array.isArray(vals) ? vals : [vals]).forEach((v) => {
            counts[v] = (counts[v] || 0) + 1
          })
        } catch {
          counts[raw] = (counts[raw] || 0) + 1
        }
      })
      return { id: q.id, title: q.title, type: q.type, counts }
    }

    // 评分聚合：平均 + 分布
    if (q.type === 'rating') {
      const data = answers.map(Number).filter((n) => !isNaN(n))
      const avg = data.length ? data.reduce((a, b) => a + b, 0) / data.length : 0
      const buckets = Array.from({ length: 5 }, (_, i) => ({
        score: i + 1,
        count: data.filter((d) => d === i + 1).length,
      }))
      return { id: q.id, title: q.title, type: q.type, avg, buckets }
    }

    // 文本仅列出
    return { id: q.id, title: q.title, type: q.type, samples: answers.slice(0, 5) }
  })

  // 3. 用户画像（简单计算）
  const userStats = {
    department: survey.submissions.reduce((acc, s) => {
      const d = JSON.parse(s.userInfo).department || '未知'
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  return NextResponse.json({
    totalSubmissions,
    dailyCount,
    questionStats,
    userStats,
  })
}
