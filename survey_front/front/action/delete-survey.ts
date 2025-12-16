
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
    // 软删除：更新 deletedAt 字段
    await prisma.survey.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: (e as Error).message }
  }
}
