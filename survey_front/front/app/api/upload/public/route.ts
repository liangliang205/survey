import { NextRequest, NextResponse } from 'next/server'
import { getOSSClient } from '@/lib/oss'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  if (!file.type || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const original = file.name || 'image'
  const dot = original.lastIndexOf('.')
  const ext = dot >= 0 ? original.slice(dot).toLowerCase() : ''
  const base = (dot >= 0 ? original.slice(0, dot) : original)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image'
  const filename = `${Date.now()}-${base}${ext}`

  const ossClient = getOSSClient()
  if (!ossClient) {
    return NextResponse.json({ error: 'OSS client not configured' }, { status: 500 })
  }

  try {
    const result = await ossClient.put(`uploads/${filename}`, buffer)
    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('OSS public upload failed:', error)
    return NextResponse.json({ error: 'Upload to OSS failed' }, { status: 500 })
  }
}
