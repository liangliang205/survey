'use client'

import { useState, useEffect } from 'react'
import { message, Image, Button, Table } from 'antd'
import { DownloadOutlined, ExportOutlined } from '@ant-design/icons'
import { generatePoster } from '@/action/qrcode'
import { listSurveys } from '@/action/list-surveys' // 已有 fetchSurveys 抽成同名 action

export default function QrPage() {
  const [surveys, setList] = useState<any[]>([])
  useEffect(() => {
    listSurveys().then(setList)
  }, [])

  const handleGen = async (id: string, title: string) => {
    try {
      const path = await generatePoster(id, title)
      message.success('已生成！可下载')
      // 强制刷新
      setList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, qrPath: path } : s))
      )
    } catch {
      message.error('生成失败')
    }
  }

  const columns = [
    { title: '问卷标题', dataIndex: 'title' },
    {
      title: '二维码',
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
          <span className="text-gray-400">未生成</span>
        ),
    },
    {
      title: '操作',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            type="primary"
            icon={<ExportOutlined />}
            onClick={() => handleGen(record.id, record.title)}
          >
            生成
          </Button>
          {record.qrPath && (
            <a href={record.qrPath} download={`${record.title}.png`}>
              <Button size="small" icon={<DownloadOutlined />}>
                下载
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
