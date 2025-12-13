import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { AuthProvider } from '@/components/providers/auth-provider'
import { appWithTranslation } from 'next-i18next'
import { I18nProvider } from '@/components/providers/i18n-provider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Mobile Survey System',
  description: 'Lightweight full-stack survey solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <I18nProvider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#1890ff',
                  borderRadius: 8,
                },
              }}
            >
              <AuthProvider>{children}</AuthProvider>
            </ConfigProvider>
          </AntdRegistry>
        </I18nProvider>
      </body>
    </html>
  )
}