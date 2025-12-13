import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dir = join(process.cwd(), 'public/uploads')
    const files = await readdir(dir)
    
    // 过滤非图片文件（可选，根据需求）
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
    
    const urls = imageFiles.map(file => `/uploads/${file}`)
    
    // 按时间倒序排列可能比较复杂，因为 readdir 不返回时间。
    // 如果需要排序，需要用 stat。这里先简单返回列表。
    
    return NextResponse.json({ files: urls })
  } catch (error) {
    console.error('Error reading uploads directory:', error)
    // 如果目录不存在，返回空列表
    return NextResponse.json({ files: [] })
  }
}
