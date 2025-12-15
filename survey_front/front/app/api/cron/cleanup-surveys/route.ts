import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOSSClient } from '@/lib/oss'

// 辅助函数：判断是否为上传的 URL
function isUploadUrl(url?: string | null) {
  if (!url) return false
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) return true
  if (url.includes('aliyuncs.com')) return true
  return false
}

// 辅助函数：删除文件
async function deleteFile(url: string) {
  const ossClient = getOSSClient()
  if (ossClient && url.includes('aliyuncs.com')) {
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname
      await ossClient.delete(path)
    } catch (e) {
      console.error('Delete OSS file failed:', e)
    }
  }
}

export async function GET(request: Request) {
  // 建议配置 CRON_SECRET 环境变量并在 Vercel Cron 中设置 Header
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. 找出 180 天前软删除的问卷
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - 180)

    const surveysToDelete = await prisma.survey.findMany({
      where: {
        deletedAt: {
          lt: dateThreshold,
        },
      },
      select: {
        id: true,
        bgImageCover: true,
        bgImageQuestions: true,
        bgImageThanks: true,
        supportCardImage: true,
      },
    })

    console.log(`Found ${surveysToDelete.length} surveys to cleanup`)

    for (const survey of surveysToDelete) {
      // 2. 处理文件删除
      const imagesToCheck = [
        survey.bgImageCover,
        survey.bgImageQuestions,
        survey.bgImageThanks,
        survey.supportCardImage,
      ].filter((url): url is string => !!url && isUploadUrl(url))

      const uniqueImages = Array.from(new Set(imagesToCheck))

      for (const imgUrl of uniqueImages) {
        // 检查是否还有其他问卷在使用这张图
        const count = await prisma.survey.count({
          where: {
            id: { not: survey.id }, // 排除自己
            OR: [
              { bgImageCover: imgUrl },
              { bgImageQuestions: imgUrl },
              { bgImageThanks: imgUrl },
              { supportCardImage: imgUrl },
            ],
          },
        })

        if (count === 0) {
          await deleteFile(imgUrl)
        }
      }

      // 删除二维码
      const ossClient = getOSSClient()
      if (ossClient) {
        try {
          await ossClient.delete(`qrcodes/${survey.id}.png`)
        } catch (e) {
          // ignore
        }
      }

      // 3. 物理删除数据库记录
      await prisma.survey.delete({
        where: { id: survey.id },
      })
    }

    return NextResponse.json({ success: true, count: surveysToDelete.length })
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
