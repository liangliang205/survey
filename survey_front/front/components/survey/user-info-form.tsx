
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from 'antd'
import { getUserInfoSchema } from './survey-context'
import { UserInfo } from '@/lib/types'
import { useSurveyStore } from './survey-context'
import { useTranslation } from 'next-i18next'

export function UserInfoForm() {
  const { t } = useTranslation('common')
  const setStep = useSurveyStore((state) => state.setStep)
  const setUserInfo = useSurveyStore((state) => state.setUserInfo)

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

  const onSubmit = (data: UserInfo) => {
    setUserInfo(data)
    setStep('questions')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
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
              render={({ field }) => (
                <Input {...field} placeholder={t('enter_phone')} />
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
          <Button type="primary" htmlType="submit" block size="large">
            {t('next')}
          </Button>
        </form>
      </div>
    </div>
  )
}