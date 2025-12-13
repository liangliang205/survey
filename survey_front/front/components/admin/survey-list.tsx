'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Popconfirm, message, Space } from 'antd'
import { EyeOutlined, QrcodeOutlined, DeleteOutlined } from '@ant-design/icons'
import { deleteSurvey } from '@/action/delete-survey'
import SurveyPreviewDrawer from './survey-preview-drawer'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/navigation'

export default function SurveyList({ refreshFlag, onSelect }: { refreshFlag: number; onSelect?: (survey: any) => void }) {
  const { t } = useTranslation('common')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const router = useRouter()

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
      message.success(t('message.success_deleted'))
      // 触发父组件刷新
      setData((prev) => prev.filter((s) => s.id !== id))
    } else {
      message.error(res.error || t('message.creation_failed'))
    }
  }
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  type SurveyRow = {
    id: string
    title: string
    isActive: boolean
    _count?: { submissions?: number }
  }
  const columns = [
    { title: t('survey_title'), dataIndex: 'title', ellipsis: true },
    { title: t('is_active'), dataIndex: 'isActive', render: (v: boolean) => (v ? t('is_active') : t('not_generated')) },
    {
      title: t('data_page.total_submissions'),
      dataIndex: '_count',
      render: (r: any) => (
        <span className="text-blue-600 font-bold">{r.submissions || 0}</span>
      ),
    },
    // 列表 columns 追加：
    {
      title: t('preview'),
      key: 'preview',
      render: (_: unknown, r: SurveyRow) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setPreviewId(r.id)
            setOpen(true)
          }}
        >
          {t('preview')}
        </Button>
      ),
    },
    {
      title: t('operations'),
      key: 'action',
      width: 260,
      className: 'text-nowrap',
      render: (_: unknown, record: SurveyRow) => (
        <Space size="middle" wrap>
          <Button
            icon={<EyeOutlined />}
            size="middle"
            className="px-4"
            onClick={() => window.open(`/s/${record.id}`, '_blank')}
          />
          <Button
            icon={<QrcodeOutlined />}
            size="middle"
            className="px-4"
            onClick={() => router.push(`/admin/qrcode?id=${record.id}`)}
          />
          <Button
            size="middle"
            className="px-4"
            onClick={async () => {
              try {
                const res = await fetch(`/api/admin/survey-detail/${record.id}`)
                const detail = await res.json()
                onSelect && onSelect(detail)
              } catch (e) {
                message.error(t('message.creation_failed'))
              }
            }}
          >
            {t('edit')}
          </Button>
          <Popconfirm
            title={t('delete_confirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="middle" className="px-4" />
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