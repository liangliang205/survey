'use client'

import { Card, Avatar, Space, Progress } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import Image from 'next/image'

interface SurveyPreviewProps {
  survey: any | null
}

export function SurveyPreview({ survey }: SurveyPreviewProps) {
  if (!survey) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        请在左侧选择一个问卷进行预览
      </div>
    )
  }

  return (
    <div className="relative mx-auto bg-gray-800 rounded-2xl p-2 shadow-2xl" style={{ width: 375, height: 812 }}>
      <div className="bg-black h-8 rounded-t-xl flex items-center justify-center">
        <div className="bg-gray-700 h-4 w-32 rounded-full" />
      </div>
      <div className="bg-white h-full rounded-b-xl overflow-y-auto">
        {/* 封面页预览 */}
        <div className="min-h-full flex flex-col">
          {survey.bgImage ? (
            <div className="relative w-full h-48">
              <Image src={survey.bgImage} alt={survey.title} fill className="object-cover" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 h-48 flex items-center justify-center">
              <Avatar size={64} icon={<UserOutlined />} className="bg-white/30" />
            </div>
          )}
          
          <div className="flex-1 p-6 flex flex-col justify-center">
            <h1 className="text-2xl font-bold mb-4">{survey.title || '未命名问卷'}</h1>
            {survey.description && (
              <p className="text-gray-600 mb-8">{survey.description}</p>
            )}
            <div className="bg-blue-500 text-white py-3 px-6 rounded-lg text-center">
              开始填写
            </div>
          </div>
        </div>

        {/* 问题预览 */}
        <div className="p-6 border-t">
          <div className="text-sm text-gray-500 mb-4">
            共 {survey.questions?.length || 0} 个问题
          </div>
          
          {survey.questions?.map((q: any, index: number) => (
            <Card key={q.id} size="small" className="mb-4">
              <div className="text-sm text-gray-500 mb-1">问题 {index + 1}</div>
              <div className="font-medium mb-3">
                {q.required && <span className="text-red-500 mr-1">*</span>}
                {q.title || '未填写问题'}
              </div>
              
              {/* 根据类型预览 */}
              {q.type === 'radio' && (
                <Radio.Group disabled>
                  <Space direction="vertical">
                    {q.options?.map((opt: any) => (
                      <Radio key={opt.id} value={opt.value}>
                        {opt.value}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
              
              {q.type === 'checkbox' && (
                <Checkbox.Group disabled>
                  <Space direction="vertical">
                    {q.options?.map((opt: any) => (
                      <Checkbox key={opt.id} value={opt.value}>
                        {opt.value}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              )}
              
              {q.type === 'text' && (
                <Input.TextArea rows={3} disabled placeholder={q.placeholder || '请输入回答'} />
              )}
              
              {q.type === 'rating' && (
                <Rate disabled />
              )}
              
              {q.type === 'date' && (
                <DatePicker style={{ width: '100%' }} disabled />
              )}
            </Card>
          ))}
        </div>

        {/* 进度条预览 */}
        <div className="p-6 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">进度预览</div>
          <Progress percent={50} showInfo={false} size="small" />
        </div>
      </div>
    </div>
  )
}