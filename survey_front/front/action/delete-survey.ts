'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteSurvey(id: string) {
  try {
    // 级联 true 已经在 schema 配了 onDelete: Cascade
    await prisma.survey.delete({ where: { id } })
    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: (e as Error).message }
  }
}
