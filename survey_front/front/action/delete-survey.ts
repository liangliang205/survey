
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { unlink } from 'fs/promises'
import { join } from 'path'

function isUploadUrl(url?: string | null) {
  return !!url && (url.startsWith('/uploads/') || url.startsWith('uploads/'))
}

async function safeUnlinkByUrl(url?: string | null) {
  try {
    if (!isUploadUrl(url)) return
    const relative = url!.startsWith('/') ? url!.slice(1) : url!
    const abs = join(process.cwd(), 'public', relative)
    await unlink(abs)
  } catch (err) {
    // ignore file not found
  }
}

export async function deleteSurvey(id: string) {
  try {
    // 先读取相关背景图路径
    const survey = await prisma.survey.findUnique({
      where: { id },
      select: {
        bgImage: true,
        bgImageCover: true,
        bgImageQuestions: true,
        bgImageThanks: true,
      },
    })

    // 删除数据库记录（关联数据按 schema 级联删除）
    await prisma.survey.delete({ where: { id } })

    // 尝试删除上传的背景图文件
    await Promise.all([
      safeUnlinkByUrl(survey?.bgImage),
      safeUnlinkByUrl(survey?.bgImageCover),
      safeUnlinkByUrl(survey?.bgImageQuestions),
      safeUnlinkByUrl(survey?.bgImageThanks),
    ])

    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: (e as Error).message }
  }
}
