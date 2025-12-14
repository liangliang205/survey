
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
        supportCardImage: true,
      },
    })

    // 删除数据库记录（关联数据按 schema 级联删除）
    await prisma.survey.delete({ where: { id } })

    // 收集所有需要检查的图片路径
    const imagesToCheck = [
      survey?.bgImage,
      survey?.bgImageCover,
      survey?.bgImageQuestions,
      survey?.bgImageThanks,
      survey?.supportCardImage,
    ].filter((url): url is string => !!url && isUploadUrl(url))

    // 去重
    const uniqueImages = Array.from(new Set(imagesToCheck))

    for (const imgUrl of uniqueImages) {
      // 检查是否还有其他问卷在使用这张图
      const count = await prisma.survey.count({
        where: {
          OR: [
            { bgImage: imgUrl },
            { bgImageCover: imgUrl },
            { bgImageQuestions: imgUrl },
            { bgImageThanks: imgUrl },
            { supportCardImage: imgUrl },
          ],
        },
      })

      // 如果没有其他问卷使用，则删除文件
      if (count === 0) {
        await safeUnlinkByUrl(imgUrl)
      }
    }

    // 删除二维码文件
    try {
      const qrcodePath = join(process.cwd(), 'public', 'qrcodes', `${id}.png`)
      await unlink(qrcodePath)
    } catch (e) {
      // ignore if file not found
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: (e as Error).message }
  }
}
