'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'

interface AdminUser {
  id: string
  username: string
  name: string | null
  role: string
  createdAt: string
}

export default function AccountList() {
  const { t } = useTranslation('common')
  const { data: session } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form] = Form.useForm()

  // @ts-ignore
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/accounts')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      message.error(t('message.load_failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: AdminUser) => {
    setEditingUser(record)
    form.setFieldsValue({
      username: record.username,
      name: record.name,
      password: '', // 编辑时不回显密码
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        message.success(t('message.delete_success'))
        fetchUsers()
      } else {
        const data = await res.json()
        message.error(data.error || t('message.delete_failed'))
      }
    } catch (error) {
      message.error(t('message.delete_failed'))
    }
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const isEdit = !!editingUser
      const url = isEdit ? `/api/admin/accounts/${editingUser.id}` : '/api/admin/accounts'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        message.success(isEdit ? t('message.update_success') : t('message.create_success'))
        setIsModalOpen(false)
        fetchUsers()
      } else {
        const data = await res.json()
        message.error(data.error || (isEdit ? t('message.update_failed') : t('message.create_failed')))
      }
    } catch (error) {
      // Form validation error
    }
  }

  const columns = [
    {
      title: t('username'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'SUPER_ADMIN' ? 'gold' : 'blue'}>
          {role === 'SUPER_ADMIN' ? t('super_admin') : t('admin')}
        </Tag>
      ),
    },
    {
      title: t('created_at'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('action'),
      key: 'action',
      render: (_: any, record: AdminUser) => {
        // 只有超级管理员可以操作
        if (!isSuperAdmin) return null
        
        // 超级管理员不能删除/编辑自己（在列表里）或者其他超级管理员（视需求而定）
        // 这里假设超级管理员不能编辑其他超级管理员，也不能删除
        if (record.role === 'SUPER_ADMIN') return null

        return (
          <Space>
            <Button 
              icon={<EditOutlined />} 
              type="text" 
              onClick={() => handleEdit(record)}
            />
            <Popconfirm
              title={t('confirm_delete')}
              onConfirm={() => handleDelete(record.id)}
              okText={t('yes')}
              cancelText={t('no')}
            >
              <Button icon={<DeleteOutlined />} type="text" danger />
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {isSuperAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('add_account')}
          </Button>
        )}
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingUser ? t('edit_account') : t('add_account')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label={t('username')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="name"
            label={t('name')}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('password')}
            rules={[{ required: !editingUser, message: t('validation.required') }]}
            help={editingUser ? t('password_hint_edit') : undefined}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
