'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Popconfirm, message, Space } from 'antd'
import { EyeOutlined, QrcodeOutlined, DeleteOutlined } from '@ant-design/icons'
import { deleteSurvey } from '@/action/delete-survey'
import SurveyPreviewDrawer from './survey-preview-drawer'

export default function SurveyList({ refreshFlag }: { refreshFlag: number }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])

  // 获取列表
  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/surveys')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [refreshFlag])

  const handleDelete = async (id: string) => {
    const res = await deleteSurvey(id)
    if (res.success) {
      message.success('已删除')
      // 触发父组件刷新
      setData((prev) => prev.filter((s) => s.id !== id))
    } else {
      message.error(res.error || '删除失败')
    }
  }
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const columns = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '状态', dataIndex: 'isActive', render: (v: boolean) => (v ? '启用' : '停用') },
    {
      title: '答卷',
      dataIndex: '_count',
      render: (r: any) => (
        <span className="text-blue-600 font-bold">{r.submissions || 0}</span>
      ),
    },
    // 列表 columns 追加：
    {
      title: '预览',
      key: 'preview',
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setPreviewId(r.id)
            setOpen(true)
          }}
        >
          查看内容
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.open(`/s/${record.id}`, '_blank')}
          />
          <Button
            icon={<QrcodeOutlined />}
            size="small"
            onClick={() => window.open(`/admin/qrcode?id=${record.id}`, '_blank')}
          />
          <Popconfirm
            title="确定删除吗？所有答卷会一并删除。"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <> 
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ hideOnSinglePage: true }}
      size="small"
    />
      <SurveyPreviewDrawer
        surveyId={previewId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>

  )
}
