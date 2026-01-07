"use client"

import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Image, Popconfirm, Segmented, message, Spin, Typography } from 'antd'
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Title, Text } = Typography

export default function UploadsPage() {
  const { t } = useTranslation('common')
  const [loading, setLoading] = useState(false)
  const [deletingKey, setDeletingKey] = useState<string>('')
  const [files, setFiles] = useState<string[]>([])
  const [scope, setScope] = useState<'survey' | 'uploads' | 'qrcodes'>('survey')

  const load = useCallback(async (targetScope: 'survey' | 'uploads' | 'qrcodes') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/uploads/list?scope=${targetScope}`)
      const data = await res.json()
      setFiles(data.files || [])
    } catch (err) {
      message.error(t('message.load_failed', { defaultValue: '加载失败' }))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load(scope)
  }, [load, scope])

  const handleDelete = async (url: string) => {
    setDeletingKey(url)
    try {
      const res = await fetch('/api/admin/uploads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.success) {
        message.success(t('survey_image_delete_success', { defaultValue: '图片删除成功' }))
        setFiles((prev) => prev.filter((item) => item !== url))
      } else {
        message.error(data.error || t('survey_image_delete_failed', { defaultValue: '图片删除失败' }))
      }
    } catch (err) {
      message.error(t('survey_image_delete_failed', { defaultValue: '图片删除失败' }))
    } finally {
      setDeletingKey('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Title level={4} className="!mb-0">{t('image_library', { defaultValue: '图片库' })}</Title>
          <Segmented
            value={scope}
            onChange={(val) => setScope(val as 'survey' | 'uploads' | 'qrcodes')}
            options={[
              { label: t('survey_image_scope', { defaultValue: '问卷上传' }), value: 'survey' },
              { label: t('uploads_image_scope', { defaultValue: '公共上传' }), value: 'uploads' },
              { label: t('qrcodes_image_scope', { defaultValue: '二维码素材' }), value: 'qrcodes' }
            ]}
          />
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => load(scope)} loading={loading}>
          {t('reload', { defaultValue: '刷新' })}
        </Button>
      </div>

      <Spin spinning={loading}>
        {files.length === 0 ? (
          <Card>
            <Text type="secondary">{t('no_images_upload', { defaultValue: '暂时没有图片' })}</Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((url) => (
              <Card
                key={url}
                hoverable
                className="group relative"
                cover={
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={url} 
                      alt={url} 
                      preview={{ src: url }} 
                      className="h-full w-full object-cover"
                      wrapperClassName="h-full w-full"
                    />
                  </div>
                }
                actions={[
                  <Popconfirm
                    title={t('survey_image_delete_confirm', { defaultValue: '确认删除这张图片吗？' })}
                    onConfirm={() => handleDelete(url)}
                    okText={t('yes', { defaultValue: '确定' })}
                    cancelText={t('no', { defaultValue: '取消' })}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} loading={deletingKey === url}>
                       {t('delete', { defaultValue: '删除' })}
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className="px-2 -mt-3">
                   <div className="text-xs text-gray-400 truncate mb-1" title={url.split('/').pop()}>
                      {url.split('/').pop()?.split('?')[0]}
                   </div>
                   <Button 
                     size="small" 
                     block 
                     onClick={() => {
                        // Copy clean URL (without signature) for usage
                        try {
                          const u = new URL(url)
                          const cleanUrl = `${u.origin}${u.pathname}`
                          navigator.clipboard.writeText(cleanUrl)
                          message.success(t('link_copied') || 'Link copied')
                        } catch {
                          navigator.clipboard.writeText(url)
                        }
                     }}
                   >
                     {t('copy_link')}
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Spin>
    </div>
  )
}
