
'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Upload, message, Image as AntImage } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/components/providers/settings-provider'

export default function SettingsPage() {
  const { t } = useTranslation('common')
  const { settings, refreshSettings } = useSettings()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings)
    }
  }, [settings, form])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        message.success(t('message.save_success'))
        refreshSettings()
      } else {
        message.error(t('message.save_failed'))
      }
    } catch (error) {
      message.error(t('message.save_failed'))
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: { authorization: 'authorization-text' },
    onChange(info) {
      if (info.file.status === 'done') {
        const url = info.file.response?.url
        if (url) {
          form.setFieldValue('appIcon', url)
          message.success(t('message.upload_success'))
        } else {
          message.error(t('message.upload_failed'))
        }
      } else if (info.file.status === 'error') {
        message.error(t('message.upload_failed'))
      }
    },
    showUploadList: false,
  }

  return (
    <div className="p-6">
      <Card title={t('system_settings')}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="appName"
            label={t('app_name')}
            rules={[{ required: true, message: t('validation.app_name_required') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="appDesc"
            label={t('app_desc')}
            rules={[{ required: true, message: t('validation.app_desc_required') }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label={t('app_icon')}>
            <div className="flex items-start gap-4">
              <Form.Item name="appIcon" noStyle>
                <Input type="hidden" />
              </Form.Item>
              <Form.Item shouldUpdate={(prev, curr) => prev.appIcon !== curr.appIcon} noStyle>
                {({ getFieldValue }) => {
                  const url = getFieldValue('appIcon')
                  return url ? (
                    <div className="relative group">
                      <AntImage
                        src={url}
                        width={100}
                        height={100}
                        style={{ objectFit: 'contain', border: '1px solid #eee', borderRadius: 8 }}
                      />
                      <div 
                        className="absolute top-0 right-0 p-1 cursor-pointer bg-white/80 rounded-bl"
                        onClick={() => form.setFieldValue('appIcon', '')}
                      >
                        <DeleteOutlined className="text-red-500" />
                      </div>
                    </div>
                  ) : null
                }}
              </Form.Item>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>{t('upload_icon')}</Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('save_settings')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
