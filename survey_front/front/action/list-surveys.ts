'use server'
import { prisma } from '@/lib/prisma'

export async function listSurveys() {
  // 仅返回 id/title/qrPath，且未被软删除的
  const list = await prisma.survey.findMany({
    where: { deletedAt: null },
    select: { id: true, title: true },
  })
  return list.map((s) => ({
    ...s,
    qrPath: undefined /* 前端展示逻辑 */,
  }))
}
