'use client'

import { useState, useEffect } from 'react'
import { Button, Form, Input, Switch, Card, Space, Select, Radio, Checkbox, Rate, Upload, message, Tabs, Modal, Image as AntImage, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined, UpOutlined, DownOutlined, PictureOutlined, AppstoreOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { saveSurvey } from '@/action/save-survey'
import { useTranslation } from 'react-i18next'

const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select

interface OptionInput {
  id: string
  value: string
}

interface QuestionInput {
  id?: string
  title: string
  type: 'radio' | 'checkbox' | 'text' | 'rating' | 'image'
  options: OptionInput[]
  order: number
  required: boolean
  placeholder?: string
  exampleImage?: string
}

interface UserInfoFieldInput {
  id?: string
  title: string
  type: 'text' | 'email' | 'phone' | 'image'
  required: boolean
  order: number
  placeholder?: string
  exampleImage?: string
}

interface SurveyEditorProps {
  survey: any | null
  onSave: () => void
  onChange?: (editingSurvey: any) => void
}

export function SurveyEditor({ survey, onSave, onChange }: SurveyEditorProps) {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('basic')
  const [questions, setQuestions] = useState<QuestionInput[]>([])
  const [userInfoFields, setUserInfoFields] = useState<UserInfoFieldInput[]>([])
  const [loading, setLoading] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageList, setImageList] = useState<string[]>([])
  const [imageLoading, setImageLoading] = useState(false)
  const [currentImageField, setCurrentImageField] = useState<string>('')
  const [imageSelectContext, setImageSelectContext] = useState<{ type: 'field' | 'questionExample' | 'userInfoExample'; index?: number }>({ type: 'field' })
  const [surveyMode, setSurveyMode] = useState<'normal' | 'redirect'>('normal')
  const [supportMode, setSupportMode] = useState<'default' | 'link'>('default')
  const { t } = useTranslation() // 添加这一行来获取 t 函数

  const fetchImages = async () => {
    setImageLoading(true)
    try {
      const res = await fetch('/api/admin/uploads/list')
      const data = await res.json()
      if (data.files) {
        // Only return clean public URLs for the editor selector, remove query params (signatures)
        // We assume the bucket is public-read for the survey-facing images to work permanently
        // But the list API returns signed URLs. We need to strip signature for permanent storage in DB
        // unless the bucket is private, making permanent URLs impossible without a proxy.
        // Assuming public-read bucket for survey assets:
        const cleanUrls = data.files.map((url: string) => {
          try {
             const u = new URL(url)
             return `${u.origin}${u.pathname}`
          } catch {
             return url
          }
        })
        setImageList(cleanUrls)
      }
    } catch (error) {
      message.error(t('message.load_failed'))
    } finally {
      setImageLoading(false)
    }
  }

  const openImageSelector = (field: string) => {
    setCurrentImageField(field)
    setImageSelectContext({ type: 'field' })
    fetchImages()
    setIsImageModalOpen(true)
  }

  const openImageSelectorForQuestionExample = (index: number) => {
    setImageSelectContext({ type: 'questionExample', index })
    fetchImages()
    setIsImageModalOpen(true)
  }

  const openImageSelectorForUserInfoExample = (index: number) => {
    setImageSelectContext({ type: 'userInfoExample', index })
    fetchImages()
    setIsImageModalOpen(true)
  }

  const handleSelectImage = (url: string) => {
    if (imageSelectContext.type === 'questionExample' && typeof imageSelectContext.index === 'number') {
      updateQuestion(imageSelectContext.index, { exampleImage: url })
    } else if (imageSelectContext.type === 'userInfoExample' && typeof imageSelectContext.index === 'number') {
      updateUserInfoField(imageSelectContext.index, { exampleImage: url })
    } else {
      form.setFieldValue(currentImageField, url)
    }
    setIsImageModalOpen(false)
  }

  useEffect(() => {
    if (survey) {
      form.setFieldsValue({
        title: survey.title,
        isActive: survey.isActive,
        bgImage: survey.bgImage,
        bgImageCover: survey.bgImageCover,
        bgImageQuestions: survey.bgImageQuestions,
        bgImageThanks: survey.bgImageThanks,
        supportCardImage: survey.supportCardImage,
        supportButtonText: survey.supportButtonText,
        supportButtonUrl: survey.supportButtonUrl,
        redirectUrl: survey.redirectUrl,
      })
      setSurveyMode(survey.redirectUrl ? 'redirect' : 'normal')
      setSupportMode(survey.supportButtonUrl ? 'link' : 'default')
      setQuestions(
        survey.questions.map((q: any) => ({
          id: q.id,
          title: q.title,
          type: q.type,
          options: q.options || [],
          order: q.order,
          required: q.required,
          placeholder: q.placeholder,
          exampleImage: q.exampleImage,
        }))
      )
      
      // 初始化用户信息字段
      setUserInfoFields(
        survey.userInfoFields?.map((f: any) => ({
          id: f.id,
          title: f.title,
          type: f.type,
          required: f.required,
          order: f.order,
          placeholder: f.placeholder,
          exampleImage: f.exampleImage,
        })) || []
      )
      
      // 初始化同步一次
      if (onChange) {
        onChange({
          ...survey,
          questions: survey.questions.map((q: any) => ({
            id: q.id,
            title: q.title,
            type: q.type,
            options: q.options || [],
            order: q.order,
            required: q.required,
            placeholder: q.placeholder,
            exampleImage: q.exampleImage,
          })),
          userInfoFields: survey.userInfoFields?.map((f: any) => ({
            id: f.id,
            title: f.title,
            type: f.type,
            required: f.required,
            order: f.order,
            placeholder: f.placeholder,
            exampleImage: f.exampleImage,
          })) || []
        })
      }
    } else {
      form.resetFields()
      setQuestions([])
      setUserInfoFields([])
      if (onChange) onChange(null)
    }
  }, [survey])

  const addQuestion = () => {
    const newQuestion: QuestionInput = {
      title: '',
      type: 'radio',
      options: [
        { id: `opt-${Date.now()}-1`, value: '选项1' },
        { id: `opt-${Date.now()}-2`, value: '选项2' },
      ],
      order: questions.length,
      required: true,
      placeholder: '',
      exampleImage: '',
    }
    const updated = [...questions, newQuestion]
    setQuestions(updated)
    // 确保添加问题后激活新问题的Tab
     setActiveTab('questions')
    if (onChange) {
      onChange({
        ...form.getFieldsValue(),
        id: survey?.id || '',
        questions: updated,
        userInfoFields
      })
    }
  }

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i }))
    setQuestions(updated)
    if (onChange) {
      onChange({
        ...form.getFieldsValue(),
        id: survey?.id || '',
        questions: updated,
        userInfoFields
      })
    }
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const updated = [...questions]
    if (direction === 'up' && index > 0) {
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
      updated[index - 1].order = index - 1
      updated[index].order = index
    } else if (direction === 'down' && index < updated.length - 1) {
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]]
      updated[index + 1].order = index + 1
      updated[index].order = index
    }
    setQuestions(updated)
    if (onChange) {
      onChange({
        ...form.getFieldsValue(),
        id: survey?.id || '',
        questions: updated,
        userInfoFields
      })
    }
  }

  const updateQuestion = (index: number, updates: Partial<QuestionInput>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
    if (onChange) {
      onChange({
        ...form.getFieldsValue(),
        id: survey?.id || '',
        questions: updated,
        userInfoFields
      })
    }
  }

  // 用户信息字段相关函数
  const addUserInfoField = () => {
    const newField: UserInfoFieldInput = {
      title: '',
      type: 'text',
      required: true,
      order: userInfoFields.length,
      placeholder: '',
      exampleImage: '',
    }
    const updated = [...userInfoFields, newField]
    setUserInfoFields(updated)
    if (onChange) {
      onChange({
        ...form.getFieldsValue(),
        id: survey?.id || '',
        questions,
        userInfoFields: updated
      })
    }
  }

  const removeUserInfoField = (index: number) => {
    const updated = userInfoFields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i }))
    setUserInfoFields(updated)
    if (onChange) {
      onChange({
        ...form.getFieldsValue(),
        id: survey?.id || '',
        questions,
        userInfoFields: updated
      })
    }
  }

  const moveUserInfoField = (index: number, direction: 'up' | 'down') => {
    const updated = [...userInfoFields]
    if (direction === 'up' && index > 0) {
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
      updated[index - 1].order = index - 1
      updated[index].order = index
    } else if (direction === 'down' && index < updated.length - 1) {
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]]
      updated[index + 1].order = index + 1
      updated[index].order = index
    }
    setUserInfoFields(updated)
    if (onChange) {
      onChange({
        ...form.getFieldsValue(),
        id: survey?.id || '',
        questions,
        userInfoFields: updated
      })
    }
  }

  const updateUserInfoField = (index: number, updates: Partial<UserInfoFieldInput>) => {
    const updated = [...userInfoFields]
    updated[index] = { ...updated[index], ...updates }
    setUserInfoFields(updated)
    if (onChange) {
      onChange({
        ...form.getFieldsValue(),
        id: survey?.id || '',
        questions,
        userInfoFields: updated
      })
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      const surveyData = {
        ...values,
        supportButtonUrl: supportMode === 'link' ? values.supportButtonUrl : '',
        questions: questions.map(q => ({
          ...q,
          options: q.options || []
        })),
        userInfoFields: userInfoFields.map(f => ({
          ...f
        }))
      }
      
      const result = await saveSurvey(survey?.id, surveyData)
      if (result.success) {
        message.success('保存成功')
        onSave()
      } else {
        message.error(result.error || '保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        const url = info.file.response?.url
        if (url) {
          form.setFieldValue('bgImage', url)
          message.success('上传成功')
        } else {
          message.error('上传失败')
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败')
      }
    },
  }

  // 分别用于三处背景的上传
  const uploadCoverProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: { authorization: 'authorization-text' },
    onChange(info) {
      if (info.file.status === 'done') {
        const url = info.file.response?.url
        if (url) {
          form.setFieldValue('bgImageCover', url)
          message.success('上传成功')
        } else {
          message.error('上传失败')
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败')
      }
    },
  }

  const uploadQuestionsProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: { authorization: 'authorization-text' },
    onChange(info) {
      if (info.file.status === 'done') {
        const url = info.file.response?.url
        if (url) {
          form.setFieldValue('bgImageQuestions', url)
          message.success('上传成功')
        } else {
          message.error('上传失败')
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败')
      }
    },
  }

  const uploadSupportCardImageProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: { authorization: 'authorization-text' },
    onChange(info) {
      if (info.file.status === 'done') {
        const url = info.file.response?.url
        if (url) {
          form.setFieldValue('supportCardImage', url)
          message.success('上传成功')
        } else {
          message.error('上传失败')
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败')
      }
    },
  }

  const uploadThanksProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: { authorization: 'authorization-text' },
    onChange(info) {
      if (info.file.status === 'done') {
        const url = info.file.response?.url
        if (url) {
          form.setFieldValue('bgImageThanks', url)
          message.success('上传成功')
        } else {
          message.error('上传失败')
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败')
      }
    },
  }

  return (
     <div className="space-y-6">
      <Form form={form} layout="vertical">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={t('basic_settings')} key="basic" forceRender>
          <Card>
              <Form.Item name="title" label={t('survey_title')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item label={t('survey_mode')}>
                <Radio.Group
                  value={surveyMode}
                  onChange={(e) => {
                    setSurveyMode(e.target.value)
                    if (e.target.value === 'normal') {
                      form.setFieldValue('redirectUrl', '')
                    }
                  }}
                >
                  <Radio value="normal">{t('normal_survey')}</Radio>
                  <Radio value="redirect">{t('direct_redirect')}</Radio>
                </Radio.Group>
              </Form.Item>

              {surveyMode === 'redirect' && (
                <Form.Item name="redirectUrl" label={t('redirect_url')} rules={[{ required: true, message: t('redirect_url_required') }]}>
                  <Input placeholder={t('redirect_url_placeholder')} />
                </Form.Item>
              )}
              
              {/* 三页面独立背景设置 */}
              <Form.Item label={t('home_background') || '首页背景图'}>
                <Space align="start">
                  <Form.Item name="bgImageCover" noStyle>
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item shouldUpdate={(prev, curr) => prev.bgImageCover !== curr.bgImageCover} noStyle>
                    {({ getFieldValue }) => {
                      const url = getFieldValue('bgImageCover')
                      return url ? (
                        <div className="relative group">
                          <AntImage src={url} height={80} width={120} style={{ objectFit: 'cover', borderRadius: 4 }} />
                          <div className="absolute top-0 right-0 p-1 cursor-pointer bg-white/80 rounded-bl" onClick={() => form.setFieldValue('bgImageCover', '')}>
                            <DeleteOutlined className="text-red-500" />
                          </div>
                        </div>
                      ) : null
                    }}
                  </Form.Item>
                  <Button icon={<AppstoreOutlined />} onClick={() => openImageSelector('bgImageCover')} style={{ minWidth: '140px' }}>{t('select_existing')}</Button>
                  <Upload {...uploadCoverProps} showUploadList={false}>
                    <Button icon={<PictureOutlined />} style={{ minWidth: '100px' }}>{t('upload')}</Button>
                  </Upload>
                </Space>
              </Form.Item>

              <Form.Item label={t('content_background') || '内容提交背景图'}>
                <Space align="start">
                  <Form.Item name="bgImageQuestions" noStyle>
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item shouldUpdate={(prev, curr) => prev.bgImageQuestions !== curr.bgImageQuestions} noStyle>
                    {({ getFieldValue }) => {
                      const url = getFieldValue('bgImageQuestions')
                      return url ? (
                        <div className="relative group">
                          <AntImage src={url} height={80} width={120} style={{ objectFit: 'cover', borderRadius: 4 }} />
                          <div className="absolute top-0 right-0 p-1 cursor-pointer bg-white/80 rounded-bl" onClick={() => form.setFieldValue('bgImageQuestions', '')}>
                            <DeleteOutlined className="text-red-500" />
                          </div>
                        </div>
                      ) : null
                    }}
                  </Form.Item>
                  <Button icon={<AppstoreOutlined />} onClick={() => openImageSelector('bgImageQuestions')} style={{ minWidth: '140px' }}>{t('select_existing')}</Button>
                  <Upload {...uploadQuestionsProps} showUploadList={false}>
                    <Button icon={<PictureOutlined />} style={{ minWidth: '100px' }}>{t('upload')}</Button>
                  </Upload>
                </Space>
              </Form.Item>

              <Form.Item label={t('thanks_background') || '提交完成背景图'}>
                <Space align="start">
                  <Form.Item name="bgImageThanks" noStyle>
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item shouldUpdate={(prev, curr) => prev.bgImageThanks !== curr.bgImageThanks} noStyle>
                    {({ getFieldValue }) => {
                      const url = getFieldValue('bgImageThanks')
                      return url ? (
                        <div className="relative group">
                          <AntImage src={url} height={80} width={120} style={{ objectFit: 'cover', borderRadius: 4 }} />
                          <div className="absolute top-0 right-0 p-1 cursor-pointer bg-white/80 rounded-bl" onClick={() => form.setFieldValue('bgImageThanks', '')}>
                            <DeleteOutlined className="text-red-500" />
                          </div>
                        </div>
                      ) : null
                    }}
                  </Form.Item>
                  <Button icon={<AppstoreOutlined />} onClick={() => openImageSelector('bgImageThanks')} style={{ minWidth: '140px' }}>{t('select_existing')}</Button>
                  <Upload {...uploadThanksProps} showUploadList={false}>
                    <Button icon={<PictureOutlined />} style={{ minWidth: '100px' }}>{t('upload')}</Button>
                  </Upload>
                </Space>
              </Form.Item>

              <Form.Item label={t('support_card_image') || '支持卡片图片'}>
                <Space align="start">
                  <Form.Item name="supportCardImage" noStyle>
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item shouldUpdate={(prev, curr) => prev.supportCardImage !== curr.supportCardImage} noStyle>
                    {({ getFieldValue }) => {
                      const url = getFieldValue('supportCardImage')
                      return url ? (
                        <div className="relative group">
                          <AntImage src={url} height={80} width={120} style={{ objectFit: 'cover', borderRadius: 4 }} />
                          <div className="absolute top-0 right-0 p-1 cursor-pointer bg-white/80 rounded-bl" onClick={() => form.setFieldValue('supportCardImage', '')}>
                            <DeleteOutlined className="text-red-500" />
                          </div>
                        </div>
                      ) : null
                    }}
                  </Form.Item>
                  <Button icon={<AppstoreOutlined />} onClick={() => openImageSelector('supportCardImage')} style={{ minWidth: '140px' }}>{t('select_existing')}</Button>
                  <Upload {...uploadSupportCardImageProps} showUploadList={false}>
                    <Button icon={<PictureOutlined />} style={{ minWidth: '100px' }}>{t('upload')}</Button>
                  </Upload>
                </Space>
              </Form.Item>
              
              <Form.Item name="isActive" label={t('is_active')} valuePropName="checked">
                <Switch />
              </Form.Item>
          </Card>
        </TabPane>
        <TabPane tab={t('user_info_fields')} key="userinfo" forceRender>
          <Card 
            title={t('user_info_fields')} 
            extra={
              <Button type="primary" onClick={addUserInfoField} icon={<PlusOutlined />}>
                {t('add_field')}
              </Button>
            }
          >
            {userInfoFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('no_user_info_fields')}
              </div>
            ) : (
              <div className="space-y-4">
                {userInfoFields.map((field, index) => (
                  <Card 
                    key={field.id || index} 
                    size="small"
                    title={`${t('field')} ${index + 1}`}
                    extra={
                      <Space>
                        <Button 
                          icon={<UpOutlined />} 
                          size="small" 
                          disabled={index === 0}
                          onClick={() => moveUserInfoField(index, 'up')}
                        />
                        <Button 
                          icon={<DownOutlined />} 
                          size="small" 
                          disabled={index === userInfoFields.length - 1}
                          onClick={() => moveUserInfoField(index, 'down')}
                        />
                        <Button 
                          icon={<DeleteOutlined />} 
                          size="small" 
                          danger
                          onClick={() => removeUserInfoField(index)}
                        />
                      </Space>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label={t('field_title')} required>
                        <Input
                          value={field.title}
                          onChange={e => updateUserInfoField(index, { title: e.target.value })}
                          placeholder={t('field_title_placeholder')}
                        />
                      </Form.Item>
                      
                      <Form.Item label={t('field_type')}>
                        <Select
                          value={field.type}
                          onChange={value => updateUserInfoField(index, { type: value as any })}
                        >
                          <Option value="text">{t('text')}</Option>
                          <Option value="email">{t('email')}</Option>
                          <Option value="phone">{t('phone')}</Option>
                          <Option value="image">{t('image')}</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item label={t('required')}>
                        <Switch
                          checked={field.required}
                          onChange={checked => updateUserInfoField(index, { required: checked })}
                        />
                      </Form.Item>
                      
                      <Form.Item label={t('placeholder')}>
                        <Input
                          value={field.placeholder}
                          onChange={e => updateUserInfoField(index, { placeholder: e.target.value })}
                          placeholder={t('placeholder')}
                        />
                      </Form.Item>

                      {field.type === 'image' && (
                        <div className="md:col-span-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{t('example_image')}</span>
                            <div className="flex gap-2">
                              <Button icon={<AppstoreOutlined />} onClick={() => openImageSelectorForUserInfoExample(index)}>
                                {t('select_existing')}
                              </Button>
                              <Upload
                                name="file"
                                accept="image/*"
                                showUploadList={false}
                                action="/api/upload"
                                onChange={(info) => {
                                  if (info.file.status === 'done') {
                                    const url = (info.file.response as any)?.url
                                    if (url) {
                                      updateUserInfoField(index, { exampleImage: url })
                                      message.success(t('message.upload_success'))
                                    } else {
                                      message.error(t('message.upload_failed'))
                                    }
                                  } else if (info.file.status === 'error') {
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
                                <Button icon={<PictureOutlined />}>{t('upload_image')}</Button>
                              </Upload>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                            <div className="space-y-2">
                              <Input
                                value={field.exampleImage}
                                onChange={e => updateUserInfoField(index, { exampleImage: e.target.value })}
                                placeholder={t('upload_image_hint')}
                              />
                              <div className="text-xs text-gray-500">{t('example_image')}</div>
                            </div>
                            <div className="border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                              {field.exampleImage ? (
                                <AntImage
                                  src={field.exampleImage}
                                  alt={t('example_image')}
                                  preview={false}
                                  style={{ width: '100%', height: 160, objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="text-gray-400 text-sm">{t('upload_image_hint')}</div>
                              )}
                            </div>
                          </div>
                          {field.exampleImage && (
                            <div className="flex justify-end">
                              <Button
                                type="link"
                                danger
                                className="p-0"
                                onClick={() => updateUserInfoField(index, { exampleImage: '' })}
                              >
                                {t('remove_image')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card title={t('support_page_settings') || '支持页面设置'} className="mt-4">
            <Form.Item label={t('support_mode') || '按钮行为模式'}>
              <Radio.Group 
                value={supportMode} 
                onChange={e => {
                  setSupportMode(e.target.value)
                  if (e.target.value === 'default') {
                    form.setFieldValue('supportButtonUrl', '')
                  }
                }}
              >
                <Radio value="default">{t('enter_survey') || '进入问卷'}</Radio>
                <Radio value="link">{t('external_link') || '跳转链接'}</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item name="supportButtonText" label={t('support_button_text') || '支持按钮文字'}>
              <Input placeholder={t('support_button_text_placeholder') || '默认为 Contact Support'} />
            </Form.Item>

            {supportMode === 'link' && (
              <Form.Item 
                name="supportButtonUrl" 
                label={t('support_button_url') || '支持按钮跳转链接'}
                rules={[{ required: true, message: t('support_button_url_required') || '请输入跳转链接' }]}
              >
                <Input placeholder={t('support_button_url_placeholder') || '请输入跳转链接'} />
              </Form.Item>
            )}
          </Card>
        </TabPane>
        
        <TabPane 
          tab={`${t('questions')} (${questions.length})`} 
          key="questions"
          forceRender
        >
          <Card 
            title={t('questions')} 
            extra={
              <Button type="primary" onClick={addQuestion} icon={<PlusOutlined />}>
                {t('add_question')}
              </Button>
            }
          >
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('no_questions')}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card 
                    key={question.id || index} 
                    size="small"
                    title={`${t('question')} ${index + 1}: ${question.title || t('unnamed')}`}
                    extra={
                      <Space>
                        <Button 
                          icon={<UpOutlined />} 
                          size="small" 
                          disabled={index === 0}
                          onClick={() => moveQuestion(index, 'up')}
                        />
                        <Button 
                          icon={<DownOutlined />} 
                          size="small" 
                          disabled={index === questions.length - 1}
                          onClick={() => moveQuestion(index, 'down')}
                        />
                        <Button 
                          icon={<DeleteOutlined />} 
                          size="small" 
                          danger
                          onClick={() => removeQuestion(index)}
                        />
                      </Space>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item label={t('question_title')} required>
                        <Input
                          value={question.title}
                          onChange={e => updateQuestion(index, { title: e.target.value })}
                          placeholder={t('question_title_placeholder')}
                        />
                      </Form.Item>
                      
                      <Form.Item label={t('question_type')}>
                        <Select
                          value={question.type}
                          onChange={value => updateQuestion(index, { type: value as any })}
                        >
                          <Option value="radio">{t('radio')}</Option>
                          <Option value="checkbox">{t('checkbox')}</Option>
                          <Option value="text">{t('text')}</Option>
                          <Option value="rating">{t('rating')}</Option>
                          <Option value="image">{t('image')}</Option>
                        </Select>
                      </Form.Item>
                      
                      {(question.type === 'radio' || question.type === 'checkbox') && (
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-center mb-2">
                            <label>{t('options')}</label>
                            <Button 
                              size="small" 
                              onClick={() => updateQuestion(index, {
                                options: [
                                  ...(question.options || []),
                                  { 
                                    id: `opt-${Date.now()}`, 
                                    value: `${t('option')} ${(question.options || []).length + 1}` 
                                  }
                                ]
                              })}
                            >
                              {t('add_option')}
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {(question.options || []).map((option, optIndex) => (
                              <Space key={option.id} className="w-full">
                                <Input
                                  value={option.value}
                                  onChange={e => {
                                    const newOptions = [...(question.options || [])]
                                    newOptions[optIndex] = { ...option, value: e.target.value }
                                    updateQuestion(index, { options: newOptions })
                                  }}
                                  placeholder={t('option_value')}
                                />
                                <Button
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    const newOptions = (question.options || []).filter((_, i) => i !== optIndex)
                                    updateQuestion(index, { options: newOptions })
                                  }}
                                />
                              </Space>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(question.type === 'text' || question.type === 'image') && (
                        <Form.Item label={t('placeholder')} className="md:col-span-2">
                          <Input
                            value={question.placeholder}
                            onChange={e => updateQuestion(index, { placeholder: e.target.value })}
                            placeholder={t('text_placeholder')}
                          />
                        </Form.Item>
                      )}

                      {question.type === 'image' && (
                        <div className="md:col-span-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{t('example_image')}</span>
                            <div className="flex gap-2">
                              <Button icon={<AppstoreOutlined />} onClick={() => openImageSelectorForQuestionExample(index)}>
                                {t('select_existing')}
                              </Button>
                              <Upload
                                name="file"
                                accept="image/*"
                                showUploadList={false}
                                action="/api/upload"
                                onChange={(info) => {
                                  if (info.file.status === 'done') {
                                    const url = (info.file.response as any)?.url
                                    if (url) {
                                      updateQuestion(index, { exampleImage: url })
                                      message.success(t('message.upload_success'))
                                    } else {
                                      message.error(t('message.upload_failed'))
                                    }
                                  } else if (info.file.status === 'error') {
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
                                <Button icon={<PictureOutlined />}>{t('upload_image')}</Button>
                              </Upload>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                            <div className="space-y-2">
                              <Input
                                value={question.exampleImage}
                                onChange={e => updateQuestion(index, { exampleImage: e.target.value })}
                                placeholder={t('upload_image_hint')}
                              />
                              <div className="text-xs text-gray-500">{t('example_image')}</div>
                            </div>
                            <div className="border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                              {question.exampleImage ? (
                                <AntImage
                                  src={question.exampleImage}
                                  alt={t('example_image')}
                                  preview={false}
                                  style={{ width: '100%', height: 180, objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="text-gray-400 text-sm">{t('upload_image_hint')}</div>
                              )}
                            </div>
                          </div>
                          {question.exampleImage && (
                            <div className="flex justify-end">
                              <Button
                                type="link"
                                danger
                                className="p-0"
                                onClick={() => updateQuestion(index, { exampleImage: '' })}
                              >
                                {t('remove_image')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Form.Item label={t('required')} className="md:col-span-2">
                        <Switch
                          checked={question.required}
                          onChange={checked => updateQuestion(index, { required: checked })}
                        />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
      </Form>
      
      <div className="flex justify-end">
        <Button type="primary" onClick={handleSave} loading={loading}>
          {t('save_survey')}
        </Button>
      </div>

      <Modal 
        title={t('select_image')} 
        open={isImageModalOpen} 
        onCancel={() => setIsImageModalOpen(false)} 
        footer={null} 
        width={800}
      >
        <Spin spinning={imageLoading}>
          <div className="grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {imageList.map(url => (
              <div 
                key={url} 
                className="cursor-pointer border hover:border-blue-500 p-2 rounded transition-all hover:shadow-md" 
                onClick={() => handleSelectImage(url)}
              >
                <AntImage 
                  src={url} 
                  preview={false} 
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 4 }} 
                />
                <div className="text-xs text-gray-500 mt-1 truncate text-center">
                  {url.split('/').pop()}
                </div>
              </div>
            ))}
            {!imageLoading && imageList.length === 0 && (
              <div className="col-span-4 text-center py-8 text-gray-500">
                {t('no_images_upload')}
              </div>
            )}
          </div>
        </Spin>
      </Modal>
    </div>
  )
 
}