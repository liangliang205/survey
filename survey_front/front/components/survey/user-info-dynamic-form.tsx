'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Form, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useSurveyStore } from './survey-context'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useTranslation } from 'next-i18next'
import { submitUserInfo } from '@/action/submit-survey'
import { PhoneInput } from './phone-input'

type DynamicFormValues = Record<string, string>

// 动态创建 Zod schema
const createDynamicSchema = (
  fields: any[],
  t: (key: string) => string
): z.ZodObject<Record<string, z.ZodString>> => {
  const schemaFields: Record<string, z.ZodString> = {}

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
        fieldSchema = fieldSchema.regex(/^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/, t('invalid_phone'))
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
  const setSubmissionId = useSurveyStore((state) => state.setSubmissionId)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  // 动态创建验证 schema
  const dynamicSchema = useMemo<z.ZodObject<Record<string, z.ZodString>>>(() => {
    return createDynamicSchema(survey.userInfoFields || [], t)
  }, [survey.userInfoFields, t])

  const { control, handleSubmit, formState: { errors } } = useForm<DynamicFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {} as DynamicFormValues
  })

  // 处理表单字段变化
  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const onSubmit = async (data: DynamicFormValues) => {
    // 将数据转换为 UserInfo 格式
    const userInfo: Record<string, string> = {}
    survey.userInfoFields?.forEach(field => {
      userInfo[field.title] = data[field.id] || ''
    })

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('surveyId', survey.id)
      formData.append('userInfo', JSON.stringify(userInfo))

      const result = await submitUserInfo(formData)
      if (result.success && result.submissionId) {
        setUserInfo(userInfo as any)
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

  // 如果没有定义用户信息字段，则使用默认字段
  if (!survey.userInfoFields || survey.userInfoFields.length === 0) {
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
          <div className="text-center text-gray-500">
            {t('no_user_info_fields_defined')}
          </div>
          <Button
            block
            size="large"
            onClick={() => setStep('questions')}
            className="mt-4 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white backdrop-blur-md hover:from-blue-500 hover:to-indigo-600 transition-colors duration-300 border-0"
          >
            {t('skip')}
          </Button>
        </div>
      </div>
    )
  }

  return (
        <div
      className="relative min-h-screen w-full flex items-center justify-center p-6"
      style={{
        backgroundImage: (survey as any).bgImageCover
          ? `url(${(survey as any).bgImageCover})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-semibold mb-6">{t('personal_info')}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {survey.userInfoFields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.title}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Controller
                  name={field.id}
                  control={control}
                  render={({ field: controllerField }) => {
                    if (field.type === 'phone') {
                      return (
                        <PhoneInput
                          name={controllerField.name}
                          value={controllerField.value}
                          onChange={(val) => {
                            controllerField.onChange(val)
                            handleFieldChange(field.id, val)
                          }}
                          onBlur={controllerField.onBlur}
                          ref={controllerField.ref}
                          error={errors[field.id]?.message as string}
                        />
                      )
                    }
                    if (field.type === 'image') {
                      const currentUrl = controllerField.value as string
                      const hasExample = !!field.exampleImage
                      const exampleImageSrc = field.exampleImage ?? undefined
                      return (
                        <div className="flex flex-row gap-4 items-start flex-wrap text-center">
                          {hasExample && (
                            <div className="border rounded-lg overflow-hidden w-1/2 min-w-[140px] flex-1 bg-white shadow-sm">
                              <img src={exampleImageSrc} alt={t('example_image')} className="w-full h-40 object-cover" />
                              <div className="px-3 py-2 text-sm text-gray-600 bg-gray-50 font-medium">{t('example_image')}</div>
                            </div>
                          )}
                          <div className={`${hasExample ? 'w-1/2 min-w-[160px] flex-1' : 'w-full'} space-y-3`}>
                            {currentUrl ? (
                              <div className="border rounded-lg overflow-hidden shadow-sm">
                                <img src={currentUrl} alt={field.title} className="w-full h-40 object-cover" />
                              </div>
                            ) : (
                              <div className="h-40 border border-dashed rounded-lg flex items-center justify-center text-gray-400 text-sm">
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
                                  setUploading(prev => ({ ...prev, [field.id]: true }))
                                }
                                if (info.file.status === 'done') {
                                  const url = (info.file.response as any)?.url
                                  setUploading(prev => ({ ...prev, [field.id]: false }))
                                  if (url) {
                                    controllerField.onChange(url)
                                    handleFieldChange(field.id, url)
                                    message.success(t('message.upload_success'))
                                  } else {
                                    message.error(t('message.upload_failed'))
                                  }
                                } else if (info.file.status === 'error') {
                                  setUploading(prev => ({ ...prev, [field.id]: false }))
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
                              <Button icon={<UploadOutlined />} loading={!!uploading[field.id]}>
                                {currentUrl ? t('replace_image') : t('upload_image')}
                              </Button>
                            </Upload>
                            {currentUrl && (
                              <Button
                                type="link"
                                danger
                                onClick={() => {
                                  controllerField.onChange('')
                                  handleFieldChange(field.id, '')
                                }}
                                className="p-0"
                              >
                                {t('remove_image')}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    }
                    return (
                      <Input
                        {...controllerField}
                        placeholder={field.placeholder || t('enter_field', { field: field.title })}
                        onChange={(e) => {
                          controllerField.onChange(e)
                          handleFieldChange(field.id, e.target.value)
                        }}
                        status={errors[field.id] ? 'error' : ''}
                      />
                    )
                  }}
                />
                {errors[field.id] && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors[field.id]?.message as string}
                  </div>
                )}
              </div>
            ))}

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