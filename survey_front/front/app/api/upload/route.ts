import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOSSClient } from '@/lib/oss'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // 简单清洗文件名，保留扩展名
  const original = file.name || 'file'
  const dot = original.lastIndexOf('.')
  const ext = dot >= 0 ? original.slice(dot).toLowerCase() : ''
  const base = (dot >= 0 ? original.slice(0, dot) : original)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file'
  const filename = `${Date.now()}-${base}${ext}`

  // 尝试使用 OSS 上传
  const ossClient = getOSSClient()
  if (!ossClient) {
    return NextResponse.json({ error: 'OSS client not configured' }, { status: 500 })
  }

  try {
    // 上传到 OSS，路径加一个前缀 uploads/
    const result = await ossClient.put(`uploads/${filename}`, buffer)
    // 假设 Bucket 设置为公共读，直接返回 URL
    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('OSS upload failed:', error)
    return NextResponse.json({ error: 'Upload to OSS failed' }, { status: 500 })
  }
}