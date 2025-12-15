
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  // Allow public access to read settings
  let settings = await prisma.systemSetting.findFirst()

  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        appName: 'Mobile Survey System',
        appDesc: 'Lightweight full-stack survey solution',
      }
    })
  }

  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { appName, appDesc, appIcon } = body

  let settings = await prisma.systemSetting.findFirst()

  if (settings) {
    settings = await prisma.systemSetting.update({
      where: { id: settings.id },
      data: {
        appName,
        appDesc,
        appIcon
      }
    })
  } else {
    settings = await prisma.systemSetting.create({
      data: {
        appName,
        appDesc,
        appIcon
      }
    })
  }

  return NextResponse.json(settings)
}
