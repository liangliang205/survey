import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { AuthProvider } from '@/components/providers/auth-provider'
import { appWithTranslation } from 'next-i18next'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { SettingsProvider } from '@/components/providers/settings-provider'
import { prisma } from '@/lib/prisma'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.systemSetting.findFirst()
    return {
      title: settings?.appName || 'Mobile Survey System',
      description: settings?.appDesc || 'Lightweight full-stack survey solution',
      icons: settings?.appIcon ? { icon: settings.appIcon } : undefined,
    }
  } catch (e) {
    return {
      title: 'Mobile Survey System',
      description: 'Lightweight full-stack survey solution',
    }
  }
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
              <SettingsProvider>
                <AuthProvider>{children}</AuthProvider>
              </SettingsProvider>
            </ConfigProvider>
          </AntdRegistry>
        </I18nProvider>
      </body>
    </html>
  )
}