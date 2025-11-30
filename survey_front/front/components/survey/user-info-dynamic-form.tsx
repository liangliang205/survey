'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Form } from 'antd'
import { useSurveyStore } from './survey-context'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useTranslation } from 'next-i18next'

// 动态创建 Zod schema
const createDynamicSchema = (fields: any[], t: (key: string) => string) => {
  const schemaFields: Record<string, any> = {}

  fields.forEach(field => {
    let fieldSchema = z.string()

    if (field.required) {
      fieldSchema = fieldSchema.min(1, `${field.title}${t('is_required')}`)
    }

    // 根据字段类型添加验证规则
    switch (field.type) {
      case 'email':
        fieldSchema = fieldSchema.email(t('invalid_email'))
        break
      case 'phone':
        fieldSchema = fieldSchema.regex(/^1[3-9]\d{9}$/, t('invalid_phone'))
        break
    }

    schemaFields[field.id] = fieldSchema
  })

  return z.object(schemaFields)
}

export function UserInfoDynamicForm() {
  const { t } = useTranslation('common')
  const survey = useSurveyStore((state) => state.survey)
  const setStep = useSurveyStore((state) => state.setStep)
  const setUserInfo = useSurveyStore((state) => state.setUserInfo)
  const [formData, setFormData] = useState<Record<string, string>>({})

  // 动态创建验证 schema
  const dynamicSchema = useMemo(() => {
    return createDynamicSchema(survey.userInfoFields || [], t)
  }, [survey.userInfoFields, t])

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {}
  })

  // 处理表单字段变化
  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const onSubmit = (data: Record<string, string>) => {
    // 将数据转换为 UserInfo 格式
    const userInfo: Record<string, string> = {}
    survey.userInfoFields?.forEach(field => {
      userInfo[field.title] = data[field.id] || ''
    })

    setUserInfo(userInfo as any)
    setStep('questions')
  }

  // 如果没有定义用户信息字段，则使用默认字段
  if (!survey.userInfoFields || survey.userInfoFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-6">{t('personal_info')}</h2>
          <div className="text-center text-gray-500">
            {t('no_user_info_fields_defined')}
          </div>
          <Button
            type="primary"
            block
            size="large"
            onClick={() => setStep('questions')}
            className="mt-4"
          >
            {t('skip')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-6">{t('personal_info')}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {survey.userInfoFields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id} className="mb-4">
                <label>
                  {field.title}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Controller
                  name={field.id}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Input
                      {...controllerField}
                      placeholder={field.placeholder || t('enter_field', { field: field.title })}
                      onChange={(e) => {
                        controllerField.onChange(e)
                        handleFieldChange(field.id, e.target.value)
                      }}
                    />
                  )}
                />
                {errors[field.id] && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors[field.id]?.message as string}
                  </div>
                )}
              </div>
            ))}

          <Button type="primary" htmlType="submit" block size="large">
            {t('next')}
          </Button>
        </form>
      </div>
    </div>
  )
}