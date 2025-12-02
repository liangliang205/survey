import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'

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

  const dir = join(process.cwd(), 'public/uploads')
  await mkdir(dir, { recursive: true })
  const path = join(dir, filename)

  await writeFile(path, buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
}