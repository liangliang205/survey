'use server'
import { prisma } from '@/lib/prisma'

export async function listSurveys() {
  // 仅返回 id/title/qrPath
  const list = await prisma.survey.findMany({ select: { id: true, title: true } })
  return list.map((s) => ({
    ...s,
    qrPath: undefined /* 前端展示逻辑 */,
  }))
}
