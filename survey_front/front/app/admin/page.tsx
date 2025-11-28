'use client'

import { useState, useEffect } from 'react'
import { prisma } from '@/lib/prisma'
import { SurveyEditor } from '@/components/admin/survey-editor'
import { SurveyPreview } from '@/components/admin/survey-preview'
import { Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { saveSurvey } from '@/action/save-survey'

export default function AdminPage() {
  const [surveys, setSurveys] = useState<any[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null)

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    const res = await fetch('/api/admin/surveys')
    const data = await res.json()
    setSurveys(data)
  }

  const createNewSurvey = async () => {
    const formData = new FormData()
    formData.append('title', '未命名问卷')
    formData.append('description', '')
    formData.append('isActive', 'true')

    const result = await saveSurvey(formData)
    if (result.success) {
      message.success('创建成功')
      fetchSurveys()
      setSelectedSurvey(result.data)
    }
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1">
        <div className="mb-4 flex justify-between">
          <Button type="primary" icon={<PlusOutlined />} onClick={createNewSurvey}>
            新建问卷
          </Button>
        </div>
        <SurveyEditor
          survey={selectedSurvey}
          onSave={fetchSurveys}
        />
      </div>
      <div className="w-96 bg-gray-100 rounded-lg p-4">
        <h3 className="font-semibold mb-4">手机预览</h3>
        <SurveyPreview survey={selectedSurvey} />
      </div>
    
      <div className="space-y-3 mb-6">
        {surveys.map((survey) => (
          <div
            key={survey.id}
            className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedSurvey(survey)}
          >
            <h3 className="font-semibold">{survey.title}</h3>
            <p className="text-gray-500 text-xs mt-1">ID: {survey.id}</p>
            <p className="text-gray-400 text-sm">提交数: {survey._count?.submissions || 0}</p>

            {/* 一键复制链接按钮 */}
            <Button
              size="small"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                const link = `${window.location.origin}/s/${survey.id}`;
                navigator.clipboard.writeText(link);
                message.success('问卷链接已复制！');
              }}
            >
              复制问卷链接
            </Button>
          </div>
        ))}
      </div>
    </div>

  )
}