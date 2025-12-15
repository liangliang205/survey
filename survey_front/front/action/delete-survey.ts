
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getOSSClient } from '@/lib/oss'

function isUploadUrl(url?: string | null) {
  if (!url) return false
  // 本地上传路径
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) return true
  // OSS 路径 (简单判断包含 aliyuncs.com)
  if (url.includes('aliyuncs.com')) return true
  return false
}

async function deleteFile(url: string) {
  const ossClient = getOSSClient()
  
  // 1. 尝试删除 OSS 文件
  if (ossClient && url.includes('aliyuncs.com')) {
    try {
      // 从 URL 中提取 object name
      // 例如: https://bucket.oss-cn-hangzhou.aliyuncs.com/uploads/xxx.jpg -> uploads/xxx.jpg
      const urlObj = new URL(url)
      const path = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname
      await ossClient.delete(path)
      return
    } catch (e) {
      console.error('Delete OSS file failed:', e)
    }
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
        await deleteFile(imgUrl)
      }
    }

    // 删除二维码文件 (尝试删除 OSS)
    const ossClient = getOSSClient()
    if (ossClient) {
      try {
        await ossClient.delete(`qrcodes/${id}.png`)
      } catch (e) {
        // ignore
      }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: (e as Error).message }
  }
}
