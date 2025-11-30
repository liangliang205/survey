'use client'

import { useSurveyStore } from './survey-context'
import { Button, Radio, Checkbox, Input, Rate, DatePicker } from 'antd'
import { useState } from 'react'
import { submitSurvey } from '@/action/submit-survey'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'next-i18next'

export function QuestionPage() {
  const { t } = useTranslation('common')
  const survey = useSurveyStore((state) => state.survey)
  const answers = useSurveyStore((state) => state.answers)
  const userInfo = useSurveyStore((state) => state.userInfo)
  const currentIndex = useSurveyStore((state) => state.currentQuestionIndex)
  const nextQuestion = useSurveyStore((state) => state.nextQuestion)
  const setAnswer = useSurveyStore((state) => state.setAnswer)
  const setStep = useSurveyStore((state) => state.setStep)

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const question = survey.questions?.[currentIndex]
  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2 text-red-500">{t('question_not_found')}</h3>
        </div>
      </div>
    )
  }
  const isLast = currentIndex === survey.questions.length - 1

  const renderQuestion = () => {
    let value = answers[question.id] ?? "";

    switch (question.type) {
      case 'radio':
        // 保证 value 为字符串
        if (typeof value !== 'string') value = '';
        return (
          <Radio.Group
            value={value}
            onChange={e => setAnswer(question.id, e.target.value)}
            style={{ width: '100%' }}
          >
            {question.options.map((opt) => (
              <Radio key={opt.id} value={opt.value} className="block mb-3">
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
            {question.options.map((opt) => (
              <Checkbox key={opt.id} value={opt.value} className="block mb-3">
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

      default:
        // 文本题只允许字符串
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

  const handleNext = async () => {
    if (isLast) {
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('surveyId', survey.id)
        formData.append('userInfo', JSON.stringify(userInfo))
        formData.append('answers', JSON.stringify(answers))

        await submitSurvey(formData)
        setStep('thanks')
        // 移除 router.refresh() 调用，避免组件重新挂载导致状态丢失
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        setLoading(false)
      }
    } else {
      nextQuestion()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            {t('question_progress', { current: currentIndex + 1, total: survey.questions.length })}
          </span>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / survey.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {question.required && <span className="text-red-500 mr-1">*</span>}
          {question.title}
        </h3>

        <div className="mt-6">{renderQuestion()}</div>

        <div className="mt-8 flex gap-3">
          {currentIndex > 0 && (
            <Button
              onClick={() => useSurveyStore.setState({ currentQuestionIndex: currentIndex - 1 })}
              className="flex-1"
            >
              {t('previous')}
            </Button>
          )}
          <Button
            type="primary"
            onClick={handleNext}
            loading={loading}
            className="flex-1"
            disabled={question.required && !answers[question.id]}
          >
            {isLast ? t('submit') : t('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}