import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOSSClient } from '@/lib/oss'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { key, url } = await req.json()
    const objectKey = (() => {
      if (key) return key
      if (url) {
        try {
          const u = new URL(url)
          // name after domain
          return decodeURIComponent(u.pathname.replace(/^\//, ''))
        } catch {
          return null
        }
      }
      return null
    })()

    if (!objectKey) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 })
    }

    const ossClient = getOSSClient()
    if (!ossClient) {
      return NextResponse.json({ error: 'OSS not configured' }, { status: 500 })
    }

    const allowedPrefixes = ['uploads/survey/', 'uploads/', 'qrcodes/']
    if (!allowedPrefixes.some(prefix => objectKey.startsWith(prefix))) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
    }

    await ossClient.delete(objectKey)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting OSS object:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
