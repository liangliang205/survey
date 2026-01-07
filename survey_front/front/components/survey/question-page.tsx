'use client'

import { useSurveyStore } from './survey-context'
import { Button, Radio, Checkbox, Input, Rate, Upload, message, Image } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { submitAnswers } from '@/action/submit-survey'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'next-i18next'

export function QuestionPage() {
  const { t } = useTranslation('common')
  const survey = useSurveyStore((state) => state.survey)
  const answers = useSurveyStore((state) => state.answers)
  const userInfo = useSurveyStore((state) => state.userInfo)
  const submissionId = useSurveyStore((state) => state.submissionId)
  const setAnswer = useSurveyStore((state) => state.setAnswer)
  const setStep = useSurveyStore((state) => state.setStep)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const router = useRouter()

  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2 text-red-500">{t('question_not_found')}</h3>
        </div>
      </div>
    )
  }

  const renderQuestion = (question: any, index: number) => {
    let value = answers[question.id] ?? "";

    const renderInput = () => {
      switch (question.type) {
        case 'radio':
          if (typeof value !== 'string') value = '';
          return (
            <Radio.Group
              value={value}
              onChange={e => setAnswer(question.id, e.target.value)}
              style={{ width: '100%' }}
            >
              {question.options.map((opt: any) => (
                <Radio key={opt.id} value={opt.value} className="block mb-2">
                  {opt.value}
                </Radio>
              ))}
            </Radio.Group>
          );

        case 'checkbox':
          return (
            <Checkbox.Group
              value={Array.isArray(value) ? value : []}
              onChange={(val) => setAnswer(question.id, val)}
              style={{ width: '100%' }}
            >
              {question.options.map((opt: any) => (
                <Checkbox key={opt.id} value={opt.value} className="block mb-2">
                  {opt.value}
                </Checkbox>
              ))}
            </Checkbox.Group>
          );

        case 'rating':
          return (
            <Rate
              value={Number(value) || 0}
              onChange={(val) => setAnswer(question.id, String(val))}
              style={{ width: '100%' }}
            />
          );

        case 'image':
          if (typeof value !== 'string') value = ''
          const hasExample = !!question.exampleImage
          return (
            <div className="flex flex-row gap-4 items-start flex-nowrap text-center">
              {hasExample && (
                <div className="border rounded-lg overflow-hidden basis-1/2 flex-1 bg-white shadow-sm min-w-0">
                  <Image
                    src={question.exampleImage}
                    alt={t('example_image')}
                    preview={{ mask: t('preview_image', { defaultValue: '点击放大查看' }) }}
                    rootClassName="block w-full h-48"
                    className="!w-full !h-full object-cover"
                  />
                  <div className="px-3 py-2 text-sm text-gray-600 bg-gray-50 font-medium">{t('example_image')}</div>
                </div>
              )}
              <div className={`${hasExample ? 'basis-1/2 flex-1 min-w-0' : 'w-full'} space-y-3`}>
                {value ? (
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <Image
                      src={value}
                      alt={question.title}
                      preview={{ mask: t('preview_image', { defaultValue: '点击放大查看' }) }}
                      rootClassName="block w-full h-48"
                      className="!w-full !h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 border border-dashed rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    {t('upload_image_hint')}
                  </div>
                )}
                <Upload
                  name="file"
                  accept="image/*"
                  showUploadList={false}
                  action="/api/upload/public"
                  onChange={(info) => {
                    if (info.file.status === 'uploading') {
                      setUploading(prev => ({ ...prev, [question.id]: true }))
                    }
                    if (info.file.status === 'done') {
                      const url = (info.file.response as any)?.url
                      setUploading(prev => ({ ...prev, [question.id]: false }))
                      if (url) {
                        setAnswer(question.id, url)
                        message.success(t('message.upload_success'))
                      } else {
                        message.error(t('message.upload_failed'))
                      }
                    } else if (info.file.status === 'error') {
                      setUploading(prev => ({ ...prev, [question.id]: false }))
                      message.error(t('message.upload_failed'))
                    }
                  }}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith('image/')
                    if (!isImage) {
                      message.error(t('only_image_supported'))
                    }
                    return isImage
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={!!uploading[question.id]}>
                    {value ? t('replace_image') : t('upload_image')}
                  </Button>
                </Upload>
                {value && (
                  <Button
                    type="link"
                    danger
                    className="p-0"
                    onClick={() => setAnswer(question.id, '')}
                  >
                    {t('remove_image')}
                  </Button>
                )}
              </div>
            </div>
          )

        default:
          if (typeof value !== 'string') value = '';
          return (
            <Input.TextArea
              value={value}
              onChange={e => setAnswer(question.id, e.target.value)}
              rows={4}
              placeholder={question.placeholder || t('enter_your_answer')}
              style={{ width: '100%' }}
            />
          );
      }
    }

    return (
      <div key={question.id} className="mb-4 p-4 bg-white/50 rounded-xl border border-gray-100">
        <h3 className="text-lg font-semibold mb-2">
          <span className="mr-2">{index + 1}.</span>
          {question.required && <span className="text-red-500 mr-1">*</span>}
          {question.title}
        </h3>
        <div className="mt-2">{renderInput()}</div>
      </div>
    )
  }

  const handleSubmit = async () => {
    const missingRequired = survey.questions.filter((q: any) => {
      if (!q.required) return false
      const val = answers[q.id]
      return !val || (Array.isArray(val) && val.length === 0)
    })

    if (missingRequired.length > 0) {
      message.error(t('please_complete_required_questions'))
      return
    }

    setLoading(true)
    try {
      if (!submissionId) {
        throw new Error('Submission ID not found')
      }
      const formData = new FormData()
      formData.append('submissionId', submissionId)
      formData.append('answers', JSON.stringify(answers))
      formData.append('surveyId', survey.id)

      await submitAnswers(formData)
      setStep('thanks')
    } catch (error) {
      console.error('提交失败:', error)
      message.error(t('submit_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen p-6 flex flex-col items-center"
      style={{
        backgroundImage: (survey as any).bgImageQuestions
          ? `url(${(survey as any).bgImageQuestions})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/30 fixed" />
      
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-5 w-full mb-8">
          {survey.questions.map((q: any, idx: number) => renderQuestion(q, idx))}

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSubmit}
              loading={loading}
              size="large"
              className="w-full md:w-1/2 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white backdrop-blur-md hover:from-blue-500 hover:to-indigo-600 transition-colors duration-300 border-0 h-12 text-lg font-medium"
            >
              {t('submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}