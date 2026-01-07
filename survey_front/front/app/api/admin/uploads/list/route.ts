import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOSSClient } from '@/lib/oss'

const PREFIX_MAP: Record<string, { prefix: string; filter?: (name: string) => boolean }> = {
  survey: {
    prefix: 'uploads/survey/'
  },
  uploads: {
    prefix: 'uploads/',
    filter: (name: string) => !name.startsWith('uploads/survey/')
  },
  qrcodes: {
    prefix: 'qrcodes/'
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const scopeParam = searchParams.get('scope') || 'survey'
    const scope = scopeParam in PREFIX_MAP ? scopeParam : 'survey'
    const { prefix, filter } = PREFIX_MAP[scope]
    // 如果配置了 OSS，优先列出 OSS 上的 uploads/ 前缀
    const ossClient = getOSSClient()
    if (!ossClient) {
      return NextResponse.json({ files: [] })
    }

    try {
      const res = await ossClient.list({ prefix, 'max-keys': 200 }, {})
      const objects = res.objects || []
      // 过滤图片后缀并返回完整 URL
      const urls = objects
        .map((o: any) => o.name)
        .filter((name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name))
        .filter((name: string) => (filter ? filter(name) : true))
        .map((name: string) => {
          // Use signed URL to ensure visibility even if bucket is private
          // Expires in 3600 seconds (1 hour)
          // Use 'image/resize,w_300' only if it's an image. We already filtered by extension.
          // Note: signatureUrl with process won't work on non-image objects if we didn't filter, but we did.
          // However, we want the ORIGINAL url for "Copy Link" probably? 
          // The UI calls this API to get list of files.
          // If we return the thumbnail signed URL, the "copy link" will copy a signed thumbnail URL which is not ideal for permanent use.
          // But for "Image Library" display, we need to see it.
          // Let's return an object { url, thumbUrl, name }?
          // But the frontend expects string[].
          
          // Let's stick to signed URL without process to correct any permission issues.
          return ossClient.signatureUrl(name, { expires: 3600 })
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
