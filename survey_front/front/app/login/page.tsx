'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Form, Input, message } from 'antd'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        username: values.username,
        password: values.password,
        redirect: false,
      })

      if (res?.ok && !res?.error) {
        message.success('登录成功')
        router.push('/admin')
        router.refresh()
      } else {
        message.error('用户名或密码错误')
      }
    } catch (error) {
      message.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">管理员登录</h1>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form>
      </div>
    </div>
  )
}