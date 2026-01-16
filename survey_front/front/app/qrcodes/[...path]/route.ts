import { NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'node:path'

const QR_ROOT_PATH = path.join(process.cwd(), 'public', 'qrcodes')

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

function sanitizeSegment(segment: string) {
  return segment.replace(/[^A-Za-z0-9._-]/g, '')
}

function resolveQrPath(segments: string[] = []) {
  const safeSegments = segments
    .filter(Boolean)
    .map(sanitizeSegment)
    .filter(Boolean)
  if (safeSegments.some(segment => segment.includes('..'))) {
    throw new Error('Invalid path')
  }

  const relativePath = safeSegments.join(path.sep)
  const filePath = path.resolve(QR_ROOT_PATH, relativePath)
  const rootWithSep = QR_ROOT_PATH.endsWith(path.sep)
    ? QR_ROOT_PATH
    : `${QR_ROOT_PATH}${path.sep}`
  if (filePath !== QR_ROOT_PATH && !filePath.startsWith(rootWithSep)) {
    throw new Error('Forbidden')
  }
  return filePath
}

export async function GET(_req: Request, ctx: { params: { path?: string[] } }) {
  try {
    const filePath = resolveQrPath(ctx.params.path)
    const st = await stat(filePath)
    if (!st.isFile()) return new NextResponse('Not Found', { status: 404 })
    const data = await readFile(filePath)
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': getMime(filePath),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
