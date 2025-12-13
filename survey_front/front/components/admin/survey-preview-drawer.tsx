'use client'

import { useEffect } from 'react'
import { Drawer, Descriptions, Tag, Space, Card, Badge } from 'antd'
import { CheckSquareOutlined, FormOutlined, StarOutlined, UnorderedListOutlined } from '@ant-design/icons'
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
            <Descriptions.Item label="状态">
              {survey.isActive ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag>}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <div className="flex items-center justify-between mb-4 mt-6">
               <h3 className="font-bold text-lg m-0">题目列表</h3>
               <Tag>{survey.questions.length} 题</Tag>
            </div>
            
            <div className="flex flex-col gap-6">
            {survey.questions.map((q: any, i: number) => (
              <Card 
                key={q.id} 
                size="small" 
                className="bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
                styles={{ header: { borderBottom: '1px solid #f0f0f0', padding: '8px 12px' }, body: { padding: '12px' } }}
                title={
                  <div className="flex items-start gap-2 whitespace-normal">
                    <Badge count={i + 1} style={{ backgroundColor: '#1890ff' }} />
                    <span className="font-medium break-all flex-1 ml-1">{q.title}</span>
                    {q.required && <Tag color="error" className="ml-auto shrink-0">必填</Tag>}
                  </div>
                }
              >
                <div className="mb-3">
                  {(() => {
                    switch (q.type) {
                      case 'radio': return <Tag color="blue" icon={<UnorderedListOutlined />}>单选</Tag>
                      case 'checkbox': return <Tag color="cyan" icon={<CheckSquareOutlined />}>多选</Tag>
                      case 'text': return <Tag color="green" icon={<FormOutlined />}>文本</Tag>
                      case 'rating': return <Tag color="gold" icon={<StarOutlined />}>评分</Tag>
                      default: return <Tag>{q.type}</Tag>
                    }
                  })()}
                </div>
                
                {(q.type === 'radio' || q.type === 'checkbox') && q.options && (
                  <div className="bg-white p-3 rounded border border-gray-100">
                    <div className="text-xs text-gray-400 mb-2">选项列表：</div>
                    <Space direction="vertical" className="w-full" size={4}>
                      {q.options.map((opt: any, idx: number) => (
                        <div key={opt.id} className="flex items-start text-sm">
                           <span className="w-6 text-gray-400 font-mono">{String.fromCharCode(65 + idx)}.</span>
                           <span className="text-gray-700">{opt.value}</span>
                        </div>
                      ))}
                    </Space>
                  </div>
                )}
                
                {q.type === 'text' && (
                   <div className="text-gray-400 text-sm italic bg-white p-3 rounded border border-dashed border-gray-200">
                     用户输入区域...
                   </div>
                )}
                 {q.type === 'rating' && (
                   <div className="text-gray-400 text-sm italic bg-white p-3 rounded border border-dashed border-gray-200">
                     评分组件 (1-5星)
                   </div>
                )}
              </Card>
            ))}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
