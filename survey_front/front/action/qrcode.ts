'use server'
import QRCode from 'qrcode'
import { getOSSClient } from '@/lib/oss'

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

  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64')
  const fileName = `${surveyId}.png`

  // 尝试上传到 OSS
  const ossClient = getOSSClient()
  if (!ossClient) {
    throw new Error('OSS client not configured')
  }

  try {
    const result = await ossClient.put(`qrcodes/${fileName}`, buffer)
    return result.url
  } catch (error) {
    console.error('OSS upload qrcode failed:', error)
    throw new Error('OSS upload qrcode failed')
  }
}
