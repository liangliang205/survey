'use client'

import { Layout, Menu } from 'antd'
import { UserOutlined, FormOutlined, QrcodeOutlined, BarChartOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Header, Sider, Content } = Layout

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // session 校验请用中间件或页面逻辑，不在 layout 里做

  const menuItems = [
    {
      key: 'dashboard',
      icon: <FormOutlined />,
      label: <Link href="/admin">问卷管理</Link>,
    },
    {
      key: 'data',
      icon: <BarChartOutlined />,
      label: <Link href="/admin/data">数据洞察</Link>,
    },
    {
      key: 'qrcode',
      icon: <QrcodeOutlined />,
      label: <Link href="/admin/qrcode">二维码</Link>,
    },
  ]

  return (
    <Layout className="min-h-screen">
      <Sider width={200} theme="light">
        <div className="flex items-center justify-center h-16 border-b">
          <h2 className="text-lg font-bold">管理后台</h2>
        </div>
        <Menu mode="inline" items={menuItems} defaultSelectedKeys={['dashboard']} />
      </Sider>
      <Layout>
        <Header className="bg-white px-6 flex items-center justify-between border-b">
          <div />
          <div className="flex items-center gap-2">
            <UserOutlined />
            <span>管理员</span>
          </div>
        </Header>
        <Content className="p-6 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  )
}