'use client'

import { useState } from 'react'
import SurveyList from '@/components/admin/survey-list'
import { SurveyEditor } from '@/components/admin/survey-editor'
import { SurveyPreview } from '@/components/admin/survey-preview'
import { Button, message, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { saveSurvey } from '@/action/save-survey'
import { useTranslation } from 'next-i18next'

export default function AdminPage() {
  const { t } = useTranslation('common')
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null)
  const [editingSurvey, setEditingSurvey] = useState<any | null>(null)
  const [refreshFlag, setRefreshFlag] = useState(0) // 触发 SurveyList 刷新

  const createNewSurvey = async () => {
    const result = await saveSurvey(null, {
      title: 'Untitled Survey',
      description: '',
      isActive: true,
      bgImage: '',
      questions: [],
      userInfoFields: []
    })
    if (result.success) {
      const newSurvey = { ...result.data, questions: [] }
      setSelectedSurvey(newSurvey)
      setEditingSurvey(newSurvey)
      setRefreshFlag((v) => v + 1) // 刷新列表
      message.success(t('message.success_created'))
    } else {
      message.error(t('message.creation_failed'))
    }
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{t('existing_surveys')}</h1>
          {/* <Button type="primary" icon={<PlusOutlined />} onClick={createNewSurvey}>
            {t('new_survey')}
          </Button> */}
        </div>

        {/* 👉 This is the new table */}
        <SurveyList refreshFlag={refreshFlag} />

        <Divider dashed />

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">{t('survey_configuration')}</h1>
        </div>
        <SurveyEditor
          survey={selectedSurvey}
          onSave={() => {
            setRefreshFlag((v) => v + 1)
            setSelectedSurvey(null) // Clear after editing
            setEditingSurvey(null)
          }}
        />
      </div>
    </div>
  )
}