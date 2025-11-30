'use client'

import { useState, useEffect } from 'react'
import { message, Image, Button, Table } from 'antd'
import { DownloadOutlined, ExportOutlined } from '@ant-design/icons'
import { generatePoster } from '@/action/qrcode'
import { listSurveys } from '@/action/list-surveys' // 已有 fetchSurveys 抽成同名 action
import { useTranslation } from 'next-i18next'

export default function QrPage() {
  const { t } = useTranslation('common')
  const [surveys, setList] = useState<any[]>([])
  useEffect(() => {
    listSurveys().then(setList)
  }, [])

  const handleGen = async (id: string, title: string) => {
    try {
      const path = await generatePoster(id, title)
      message.success(t('message.success_created'))
      // 强制刷新
      setList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, qrPath: path } : s))
      )
    } catch {
      message.error(t('message.creation_failed'))
    }
  }

  const columns = [
    { title: t('survey_title'), dataIndex: 'title' },
    {
      title: t('qrcode'),
      dataIndex: 'qrPath',
      render: (path: string) =>
        path ? (
          <Image
            src={path}
            alt="qr"
            width={100}
            preview={{ mask: false }}
            className="rounded"
          />
        ) : (
          <span className="text-gray-400">{t('not_generated')}</span>
        ),
    },
    {
      title: t('operations'),
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            type="primary"
            icon={<ExportOutlined />}
            onClick={() => handleGen(record.id, record.title)}
          >
            {t('generate')}
          </Button>
          {record.qrPath && (
            <a href={record.qrPath} download={`${record.title}.png`}>
              <Button size="small" icon={<DownloadOutlined />}>
                {t('download')}
              </Button>
            </a>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={surveys}
        pagination={false}
      />
    </div>
  )
}