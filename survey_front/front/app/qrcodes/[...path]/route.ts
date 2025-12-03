import { NextResponse } from 'next/server'
import { join, normalize } from 'path'
import { readFile, stat } from 'fs/promises'

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
}

function getMime(filename: string) {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return 'application/octet-stream'
  return MIME_MAP[filename.slice(dot).toLowerCase()] || 'application/octet-stream'
}

export async function GET(_req: Request, ctx: { params: { path: string[] } }) {
  try {
    const safeSegments = ctx.params.path.filter(Boolean).map(seg => seg.replace(/[\\/]/g, ''))
    const rel = safeSegments.join('/')
    const abs = normalize(join(process.cwd(), 'public', 'qrcodes', rel))
    const root = normalize(join(process.cwd(), 'public', 'qrcodes'))
    if (!abs.startsWith(root)) return new NextResponse('Forbidden', { status: 403 })
    const st = await stat(abs)
    if (!st.isFile()) return new NextResponse('Not Found', { status: 404 })
    const data = await readFile(abs)
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': getMime(abs),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
