'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function restoreSurvey(id: string) {
  try {
    await prisma.survey.update({
      where: { id },
      data: { deletedAt: null },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: (e as Error).message }
  }
}
