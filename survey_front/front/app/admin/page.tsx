'use client'

import { useState } from 'react'
import SurveyList from '@/components/admin/survey-list'
import { SurveyEditor } from '@/components/admin/survey-editor'
import { SurveyPreview } from '@/components/admin/survey-preview'
import { Button, message, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { saveSurvey } from '@/action/save-survey'

export default function AdminPage() {
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null)
  const [editingSurvey, setEditingSurvey] = useState<any | null>(null)
  const [refreshFlag, setRefreshFlag] = useState(0) // 触发 SurveyList 刷新

  const createNewSurvey = async () => {
    const formData = new FormData()
    formData.append('title', '未命名问卷')
    formData.append('description', '')
    formData.append('isActive', 'true')

    const result = await saveSurvey(formData)
    if (result.success) {
      const newSurvey = { ...result.data, questions: [] }
      setSelectedSurvey(newSurvey)
      setEditingSurvey(newSurvey)
      setRefreshFlag((v) => v + 1) // 刷新列表
      message.success('成功创建并进入编辑页')
    } else {
      message.error('创建失败')
    }
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">已有问卷</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={createNewSurvey}>
            新建问卷
          </Button>
        </div>

        {/* 👉 这是新加表格 */}
        <SurveyList refreshFlag={refreshFlag} />

        <Divider dashed />

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">问卷配置</h1>
        </div>
        <SurveyEditor
          survey={selectedSurvey}
          onSave={() => {
            setRefreshFlag((v) => v + 1)
            setSelectedSurvey(null) // 编辑完毕清空
            setEditingSurvey(null)
          }}
        />
      </div>
    </div>
  )
}
