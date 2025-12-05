'use client'

import { useState, useEffect } from 'react'
import { Button, Form, Input, Switch, Card, Space, Select, Radio, Checkbox, Rate, DatePicker, Upload, message, Tabs } from 'antd'
import { PlusOutlined, DeleteOutlined, UpOutlined, DownOutlined, PictureOutlined } from '@ant-design/icons'
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
  type: 'radio' | 'checkbox' | 'text' | 'rating' | 'date'
  options: OptionInput[]
  order: number
  required: boolean
  placeholder?: string
}

interface UserInfoFieldInput {
  id?: string
  title: string
  type: 'text' | 'email' | 'phone'
  required: boolean
  order: number
  placeholder?: string
}

interface SurveyEditorProps {
  survey: any | null
  onSave: () => void
  onChange?: (editingSurvey: any) => void
}

export function SurveyEditor({ survey, onSave }: SurveyEditorProps) {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('basic')
  const [questions, setQuestions] = useState<QuestionInput[]>([])
  const [userInfoFields, setUserInfoFields] = useState<UserInfoFieldInput[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation() // 添加这一行来获取 t 函数
  // 获取 onChange
  const onChange = (typeof arguments[0] === 'object' && 'onChange' in arguments[0]) ? arguments[0].onChange : undefined

  useEffect(() => {
    if (survey) {
      form.setFieldsValue({
        title: survey.title,
        description: survey.description,
        isActive: survey.isActive,
        bgImage: survey.bgImage,
        bgImageCover: survey.bgImageCover,
        bgImageThanks: survey.bgImageThanks,
      })
      setQuestions(
        survey.questions.map((q: any) => ({
          id: q.id,
          title: q.title,
          type: q.type,
          options: q.options || [],
          order: q.order,
          required: q.required,
          placeholder: q.placeholder,
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
          })),
          userInfoFields: survey.userInfoFields?.map((f: any) => ({
            id: f.id,
            title: f.title,
            type: f.type,
            required: f.required,
            order: f.order,
            placeholder: f.placeholder,
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
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={t('basic_settings')} key="basic" forceRender>
          <Card>
            <Form form={form} layout="vertical">
              <Form.Item name="title" label={t('survey_title')} rules={[{ required: true }]}>
                <Input placeholder={t('survey_title_placeholder')} />
              </Form.Item>
              
              <Form.Item name="description" label={t('survey_description')}>
                <TextArea placeholder={t('survey_description_placeholder')} rows={3} />
              </Form.Item>

              {/* 全局背景（兼容旧字段） */}
              <Form.Item name="bgImage" label={t('background_image')}>
                <Space>
                  <Input placeholder={t('background_image_placeholder')} />
                  <Upload {...uploadProps}>
                    <Button icon={<PictureOutlined />}>{t('upload')}</Button>
                  </Upload>
                </Space>
              </Form.Item>

              {/* 三页面独立背景设置 */}
              <Form.Item name="bgImageCover" label={t('cover_background') || '封面背景'}>
                <Space>
                  <Input placeholder={t('background_image_placeholder')} />
                  <Upload {...uploadCoverProps}>
                    <Button icon={<PictureOutlined />}>{t('upload')}</Button>
                  </Upload>
                </Space>
              </Form.Item>

              {/** 移除答题页背景上传项，问题页与个人信息页已合并使用同一背景 */}

              <Form.Item name="bgImageThanks" label={t('thanks_background') || '完成页背景'}>
                <Space>
                  <Input placeholder={t('background_image_placeholder')} />
                  <Upload {...uploadThanksProps}>
                    <Button icon={<PictureOutlined />}>{t('upload')}</Button>
                  </Upload>
                </Space>
              </Form.Item>
              
              <Form.Item name="isActive" label={t('is_active')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
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
                    </div>
                  </Card>
                ))}
              </div>
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
                          <Option value="date">{t('date')}</Option>
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
                      
                      {question.type === 'text' && (
                        <Form.Item label={t('placeholder')} className="md:col-span-2">
                          <Input
                            value={question.placeholder}
                            onChange={e => updateQuestion(index, { placeholder: e.target.value })}
                            placeholder={t('text_placeholder')}
                          />
                        </Form.Item>
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
      
      <div className="flex justify-end">
        <Button type="primary" onClick={handleSave} loading={loading}>
          {t('save_survey')}
        </Button>
      </div>
    </div>
  )
}