
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, message } from 'antd'
import { getUserInfoSchema } from './survey-context'
import { PhoneInput } from './phone-input'
import { UserInfo } from '@/lib/types'
import { useSurveyStore } from './survey-context'
import { useTranslation } from 'next-i18next'
import { submitUserInfo } from '@/action/submit-survey'
import { useState } from 'react'

export function UserInfoForm() {
  const { t } = useTranslation('common')
  const survey = useSurveyStore((state) => state.survey)
  const setStep = useSurveyStore((state) => state.setStep)
  const setUserInfo = useSurveyStore((state) => state.setUserInfo)
  const setSubmissionId = useSurveyStore((state) => state.setSubmissionId)
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInfo>({
    resolver: zodResolver(getUserInfoSchema(t)),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      department: '',
    },
  })

  const onSubmit = async (data: UserInfo) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('surveyId', survey.id)
      formData.append('userInfo', JSON.stringify(data))

      const result = await submitUserInfo(formData)
      if (result.success && result.submissionId) {
        setUserInfo(data)
        setSubmissionId(result.submissionId)
        setStep('contactSupport')
      }
    } catch (error) {
      console.error('提交用户信息失败:', error)
      message.error(t('submit_failed') || '提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen p-6 flex items-center justify-center"
      style={{
        backgroundImage: (survey as any).bgImageQuestions
          ? `url(${(survey as any).bgImageQuestions})`
          : (survey as any).bgImage
          ? `url(${(survey as any).bgImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-5 max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-6">{t('personal_info')}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label>{t('name')}</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder={t('enter_name')} />
              )}
            />
            {errors.name && <div style={{ color: 'red' }}>{errors.name.message}</div>}
          </div>
          <div className="mb-4">
            <label>{t('phone')}</label>
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, name, value, onBlur, ref } }) => (
                <PhoneInput
                  name={name}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  ref={ref}
                  error={errors.phone?.message}
                />
              )}
            />
            {errors.phone && <div style={{ color: 'red' }}>{errors.phone.message}</div>}
          </div>
          <div className="mb-4">
            <label>{t('email_optional')}</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder={t('enter_email')} />
              )}
            />
            {errors.email && <div style={{ color: 'red' }}>{errors.email.message}</div>}
          </div>
          <div className="mb-4">
            <label>{t('department_optional')}</label>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder={t('enter_department')} />
              )}
            />
          </div>
          <Button
            htmlType="submit"
            block
            loading={loading}
            size="large"
            className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white backdrop-blur-md hover:from-blue-500 hover:to-indigo-600 transition-colors duration-300 border-0"
          >
            {t('next')}
          </Button>
        </form>
      </div>
    </div>
  )
}