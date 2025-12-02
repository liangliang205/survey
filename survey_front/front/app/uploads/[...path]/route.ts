import { NextResponse } from 'next/server'
import { join, normalize } from 'path'
import { readFile, stat } from 'fs/promises'

// 简单的 MIME 映射，覆盖常见图片类型
const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
}

function getMimeType(filename: string) {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return 'application/octet-stream'
  const ext = filename.slice(dot).toLowerCase()
  return MIME_MAP[ext] || 'application/octet-stream'
}

export async function GET(
  _req: Request,
  ctx: { params: { path: string[] } }
) {
  try {
    // 防止路径穿越：仅在 uploads 目录内解析
    const safeSegments = ctx.params.path.filter(Boolean).map(seg => seg.replace(/[\\/]/g, ''))
    const relPath = safeSegments.join('/')
    const absPath = normalize(join(process.cwd(), 'public', 'uploads', relPath))

    // 进一步校验：归一化后必须仍在 uploads 目录下
    const uploadsRoot = normalize(join(process.cwd(), 'public', 'uploads'))
    if (!absPath.startsWith(uploadsRoot)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const st = await stat(absPath)
    if (!st.isFile()) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const data = await readFile(absPath)
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': getMimeType(absPath),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (e) {
    return new NextResponse('Not Found', { status: 404 })
  }
}
