import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOSSClient } from '@/lib/oss'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 如果配置了 OSS，优先列出 OSS 上的 uploads/ 前缀
    const ossClient = getOSSClient()
    if (!ossClient) {
      return NextResponse.json({ files: [] })
    }

    try {
      const res = await ossClient.list({ prefix: 'uploads/', 'max-keys': 100 }, {})
      const objects = res.objects || []
      // 过滤图片后缀并返回完整 URL
      const bucket = process.env.OSS_BUCKET
      const region = process.env.OSS_REGION
      const urls = objects
        .map((o: any) => o.name)
        .filter((name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name))
        .map((name: string) => {
          if (!bucket || !region) return `/${name}`
          return `https://${bucket}.${region}.aliyuncs.com/${encodeURI(name)}`
        })

      return NextResponse.json({ files: urls })
    } catch (err) {
      console.error('Error listing OSS uploads:', err)
      return NextResponse.json({ files: [] })
    }
  } catch (error) {
    console.error('Error reading uploads directory:', error)
    // 如果目录不存在，返回空列表
    return NextResponse.json({ files: [] })
  }
}
