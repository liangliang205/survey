'use client'

import { I18nextProvider } from 'react-i18next'
import { useEffect, useState } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

if (!i18n.isInitialized) {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'zh-CN',
      lng: 'zh-CN',
      // 修改loadPath，移除.json扩展名，因为API路由会自动处理
      backend: {
        loadPath: '/api/locales/{{lng}}/{{ns}}',
      },
      interpolation: {
        escapeValue: false,
      },
      // 添加默认 namespace 配置
      defaultNS: 'common',
      ns: ['common'],
      detection: {
        // 禁用 cookie 和 localStorage 检测，避免语言代码转换
        order: ['querystring', 'navigator'],
        lookupQuerystring: 'lng'
      }
    })
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.init().then(() => setLoaded(true))
    } else {
      setLoaded(true)
    }
  }, [])

  if (!loaded) {
    return <div>Loading...</div>
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}