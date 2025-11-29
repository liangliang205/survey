'use server'
import QRCode from 'qrcode'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export async function generatePoster(surveyId: string, title: string) {
  const url = `${BASE_URL}/s/${surveyId}`

  // 生成带 logo 的 base64 PNG
  const dataUrl: string = await QRCode.toDataURL(url, {
    margin: 1,
    width: 400,
    color: {
      dark: '#1677ff',
      light: '#FFFFFF',
    },
  })

  // 保存到 public
  const dir = join(process.cwd(), 'public', 'qrcodes')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const fileName = `${surveyId}.png`
  const absFile = join(dir, fileName)
  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64')
  writeFileSync(absFile, buffer)

  return `/qrcodes/${fileName}` // 可直接访问
}
