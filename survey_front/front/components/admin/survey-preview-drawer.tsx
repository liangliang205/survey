'use client'

import { useEffect } from 'react'
import { Drawer, Descriptions, Tag, Space } from 'antd'
import { useState } from 'react'

interface Props {
  surveyId: string | null
  open: boolean
  onClose: () => void
}

export default function SurveyPreviewDrawer({ surveyId, open, onClose }: Props) {
  const [survey, setSurvey] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!surveyId) return
    setLoading(true)
    fetch(`/api/admin/survey-detail/${surveyId}`)
      .then((r) => r.json())
      .then(setSurvey)
      .finally(() => setLoading(false))
  }, [surveyId])

  return (
    <Drawer
      open={open}
      title="问卷详情"
      placement="right"
      width={420}
      onClose={onClose}
      destroyOnClose
      loading={loading}
    >
      {survey && (
        <div className="space-y-4">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="标题">{survey.title}</Descriptions.Item>
            <Descriptions.Item label="描述">{survey.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {survey.isActive ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag>}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <h3 className="font-bold mb-2">题目列表</h3>
            {survey.questions.map((q: any, i: number) => (
              <div key={q.id} className="mb-3 p-2 border-b">
                <div className="font-semibold">
                  {i + 1}. {q.title}
                  {q.required && <span style={{ color: 'red' }}> *</span>}
                </div>
                <div className="text-sm text-gray-600">
                  类型：{q.type}
                  {q.type !== 'text' && q.type !== 'rating' && q.type !== 'date' && (
                    <>
                      <Space size={4} wrap className="-ml-1">
                        {q.options.map((opt: any) => (
                          <Tag key={opt.id}>{opt.value}</Tag>
                        ))}
                      </Space>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  )
}
