'use client'

import { Layout, Menu, Dropdown, Button } from 'antd'
import { UserOutlined, FormOutlined, QrcodeOutlined, BarChartOutlined, DownOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { create } from 'zustand'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const { Header, Sider, Content } = Layout

type SiderState = {
  selectedKey: string
  setSelectedKey: (key: string) => void
}

const useSiderStore = create<SiderState>((set) => ({
  selectedKey: 'dashboard',
  setSelectedKey: (key) => set({ selectedKey: key }),
}))

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // session 校验请用中间件或页面逻辑，不在 layout 里做

  const { t, i18n } = useTranslation('common')
  const pathname = usePathname()
  const selectedKey = useSiderStore((s) => s.selectedKey)
  const setSelectedKey = useSiderStore((s) => s.setSelectedKey)
  const hasSetLang = useRef(false)

  useEffect(() => {
    if (!hasSetLang.current) {
      if (i18n.language !== 'zh-CN') {
        i18n.changeLanguage('zh-CN')
      }
      hasSetLang.current = true
    }
  }, [i18n])

  const menuItems = [
    {
      key: 'dashboard',
      icon: <FormOutlined />,
      label: <Link href="/admin">{t('existing_surveys')}</Link>,
    },
    {
      key: 'data',
      icon: <BarChartOutlined />,
      label: <Link href="/admin/data">{t('data_page.select_survey')}</Link>,
    },
    {
      key: 'qrcode',
      icon: <QrcodeOutlined />,
      label: <Link href="/admin/qrcode">{t('qrcode')}</Link>,
    },
  ]

  const languageItems = [
    {
      key: 'en',
      label: 'English',
    },
    {
      key: 'zh-CN',
      label: '中文',
    },
  ]

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  // 根据当前路由自动同步选中状态
  useEffect(() => {
    if (!pathname) return
    if (pathname.startsWith('/admin/data')) {
      setSelectedKey('data')
    } else if (pathname.startsWith('/admin/qrcode')) {
      setSelectedKey('qrcode')
    } else {
      setSelectedKey('dashboard')
    }
  }, [pathname, setSelectedKey])

  return (
    <Layout className="min-h-screen">
      <Sider width={200} theme="light">
        <div className="flex items-center justify-center h-16 border-b">
          <h2 className="text-lg font-bold">{t('basic_settings')}</h2>
        </div>
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(String(key))}
        />
      </Sider>
      <Layout>
        <Header className="bg-white px-6 flex items-center justify-between border-b">
          <div />
          <div className="flex items-center gap-2">
            <Dropdown menu={{ items: languageItems, onClick: ({ key }) => changeLanguage(key) }}>
              <Button>
                {i18n.language === 'zh-CN' ? '中文' : 'English'} <DownOutlined />
              </Button>
            </Dropdown>
            <UserOutlined />
            <span>{t('admin')}</span>
          </div>
        </Header>
        <Content className="p-6 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  )
}