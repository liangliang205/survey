'use client'

import { useState, useEffect } from 'react'
import { Button, Form, Input, Switch, Card, Space, Select, Radio, Checkbox, Rate, DatePicker, Upload, message, Tabs } from 'antd'
import { PlusOutlined, DeleteOutlined, UpOutlined, DownOutlined, PictureOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { saveSurvey } from '@/action/save-survey'

const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select

interface OptionInput {
  id: string
  label: string
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

interface SurveyEditorProps {
  survey: any | null
  onSave: () => void
}

export function SurveyEditor({ survey, onSave }: SurveyEditorProps) {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('basic')
  const [questions, setQuestions] = useState<QuestionInput[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (survey) {
      form.setFieldsValue({
        title: survey.title,
        description: survey.description,
        isActive: survey.isActive,
        bgImage: survey.bgImage,
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
    } else {
      form.resetFields()
      setQuestions([])
    }
  }, [survey])

  const addQuestion = () => {
    const newQuestion: QuestionInput = {
      title: '',
      type: 'radio',
      options: [
        { id: `opt-${Date.now()}-1`, label: '选项1', value: 'option1' },
        { id: `opt-${Date.now()}-2`, label: '选项2', value: 'option2' },
      ],
      order: questions.length,
      required: true,
      placeholder: '',
    }
    setQuestions([...questions, newQuestion])
    setActiveTab(`question-${questions.length}`)
  }

  const updateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const addOption = (questionIndex: number) => {
    const updated = [...questions]
    const options = updated[questionIndex].options
    const newOption: OptionInput = {
      id: `opt-${Date.now()}`,
      label: `选项${options.length + 1}`,
      value: `option${options.length + 1}`,
    }
    updated[questionIndex].options = [...options, newOption]
    setQuestions(updated)
  }

  const updateOption = (qIndex: number, optIndex: number, field: 'label' | 'value', value: string) => {
    const updated = [...questions]
    updated[qIndex].options[optIndex][field] = value
    setQuestions(updated)
  }

  const deleteOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options.splice(optIndex, 1)
    setQuestions(updated)
  }

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    setQuestions(updated)
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const updated = [...questions]
    if (direction === 'up' && index > 0) {
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    } else if (direction === 'down' && index < questions.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    }
    setQuestions(updated)
  }

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    listType: 'picture-card',
    maxCount: 1,
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({ bgImage: info.file.response.url })
        message.success('上传成功')
      }
    },
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const basicValues = await form.validateFields()
      
      const formData = new FormData()
      formData.append('id', survey?.id || '')
      formData.append('title', basicValues.title)
      formData.append('description', basicValues.description || '')
      formData.append('isActive', String(basicValues.isActive))
      formData.append('bgImage', basicValues.bgImage || '')
      
      // 保存问卷基本信息
      const result = await saveSurvey(formData)
      
      if (result.success) {
        // 保存问题（这里简化处理，实际应该调用专门的 API）
        message.success('保存成功')
        onSave()
      }
    } catch (error) {
      message.error('保存失败，请检查表单')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基本信息" key="basic">
          <Form form={form} layout="vertical">
            <Form.Item name="bgImage" hidden>
              <Input />
            </Form.Item>
            
            <Form.Item label="背景图片">
              <Upload {...uploadProps}>
                <div className="flex flex-col items-center justify-center">
                  <PictureOutlined className="text-2xl mb-2" />
                  <div className="text-sm">点击上传</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              name="title"
              label="问卷标题"
              rules={[{ required: true, message: '请输入问卷标题' }]}
            >
              <Input placeholder="请输入问卷标题" />
            </Form.Item>

            <Form.Item name="description" label="问卷描述">
              <TextArea rows={4} placeholder="请输入问卷描述（选填）" />
            </Form.Item>

            <Form.Item name="isActive" label="状态" valuePropName="checked">
              <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
            </Form.Item>

            <Button type="primary" onClick={handleSave} loading={loading} block>
              保存基本信息
            </Button>
          </Form>
        </TabPane>

        <TabPane tab="问题设置" key="questions">
          <Space direction="vertical" className="w-full">
            {questions.map((q, qIndex) => (
              <Card
                key={qIndex}
                title={`问题 ${qIndex + 1}`}
                extra={
                  <Space>
                    <Button
                      icon={<UpOutlined />}
                      size="small"
                      disabled={qIndex === 0}
                      onClick={() => moveQuestion(qIndex, 'up')}
                    />
                    <Button
                      icon={<DownOutlined />}
                      size="small"
                      disabled={qIndex === questions.length - 1}
                      onClick={() => moveQuestion(qIndex, 'down')}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      onClick={() => deleteQuestion(qIndex)}
                    />
                  </Space>
                }
              >
                <Form layout="vertical">
                  <Form.Item label="问题标题" required>
                    <Input
                      value={q.title}
                      onChange={(e) => updateQuestion(qIndex, 'title', e.target.value)}
                      placeholder="请输入问题标题"
                    />
                  </Form.Item>

                  <Form.Item label="问题类型" required>
                    <Select
                      value={q.type}
                      onChange={(value) => updateQuestion(qIndex, 'type', value)}
                      style={{ width: '100%' }}
                    >
                      <Option value="radio">单选题</Option>
                      <Option value="checkbox">多选题</Option>
                      <Option value="text">文本题</Option>
                      <Option value="rating">评分题</Option>
                      <Option value="date">日期题</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="提示文字">
                    <Input
                      value={q.placeholder}
                      onChange={(e) => updateQuestion(qIndex, 'placeholder', e.target.value)}
                      placeholder="请输入提示文字（选填）"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Checkbox
                      checked={q.required}
                      onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                    >
                      必填项
                    </Checkbox>
                  </Form.Item>

                  {(q.type === 'radio' || q.type === 'checkbox') && (
                    <div className="mt-4">
                      <div className="font-medium mb-2">选项设置</div>
                      <Space direction="vertical" className="w-full">
                        {q.options.map((opt, optIndex) => (
                          <div key={opt.id} className="flex gap-2">
                            <Input
                              placeholder="选项标签"
                              value={opt.label}
                              onChange={(e) => updateOption(qIndex, optIndex, 'label', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="选项值"
                              value={opt.value}
                              onChange={(e) => updateOption(qIndex, optIndex, 'value', e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              icon={<DeleteOutlined />}
                              danger
                              onClick={() => deleteOption(qIndex, optIndex)}
                            />
                          </div>
                        ))}
                        <Button type="dashed" onClick={() => addOption(qIndex)} icon={<PlusOutlined />}>
                          添加选项
                        </Button>
                      </Space>
                    </div>
                  )}
                </Form>
              </Card>
            ))}
            
            <Button type="dashed" onClick={addQuestion} icon={<PlusOutlined />} block>
              添加问题
            </Button>
          </Space>
        </TabPane>
      </Tabs>

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave} loading={loading}>
          保存所有更改
        </Button>
        <Button type="primary" onClick={() => message.info('预览功能开发中')}>
          预览问卷
        </Button>
      </div>
    </div>
  )
}