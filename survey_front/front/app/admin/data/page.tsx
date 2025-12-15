'use client'

import { useLayoutEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, Select, Empty, message, Button } from 'antd'
import { Bar, Line, Pie } from '@ant-design/plots'
import { useTranslation } from 'next-i18next'


export default function DataPage() {
  const { t } = useTranslation('common')
  const search = useSearchParams()
  const [surveyId, setId] = useState<string | null>(search.get('id'))
  const [data, setData] = useState<any>(null)
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 获取问卷列表
  useLayoutEffect(() => {
    fetch('/api/admin/surveys')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSurveys(data)
        } else {
          setSurveys([])
        }
      })
      .catch(() => {
        setSurveys([])
        message.error(t('message.creation_failed'))
      })
  }, [])

  // 获取选中问卷的数据
  useLayoutEffect(() => {
    if (!surveyId) {
      setData(null)
      return
    }
    setLoading(true)
    fetch(`/api/admin/insight/${surveyId}`)
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch(() => message.error(t('message.creation_failed')))
      .finally(() => setLoading(false))
  }, [surveyId])

  const { totalSubmissions, dailyCount, questionStats, userStats } = data || {}

  // 使用后端API导出完整数据（包含个人信息）
  const handleExportExcel = async () => {
    if (!surveyId) return message.error(t('message.creation_failed'))
    try {
      setLoading(true)
      const response = await fetch(`/api/export?surveyId=${surveyId}`)
      if (!response.ok) throw new Error('导出失败')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `问卷数据_${surveyId}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      message.error(t('message.creation_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center mb-2">
        <Select
          placeholder={t('data_page.select_survey')}
          style={{ width: 300 }}
          value={surveyId}
          onChange={setId}
          loading={surveys.length === 0}
          allowClear
          notFoundContent={surveys.length === 0 ? `${t('loading')}...` : t('no_questions')}
        >
          {surveys.map((s: any) => (
            <Select.Option key={s.id} value={s.id}>{s.title}</Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={handleExportExcel} disabled={!data}>
          {t('data_page.export_excel')}
        </Button>
      </div>

      {!surveyId ? (
        <Empty description={t('data_page.no_survey_selected')} />
      ) : loading ? (
        <div className="text-gray-400">{t('data_page.loading_data')}</div>
      ) : (
        <>
          <Card title={`${t('data_page.total_submissions')}：${totalSubmissions}`}>
            <Line
              data={Object.entries(dailyCount || {}).map(([date, count]) => ({ date, count }))}
              xField="date"
              yField="count"
              height={260}
            />
          </Card>

          {questionStats?.map((q: any) => {
            if (q.type === 'radio' || q.type === 'checkbox') {
              return (
                <Card title={q.title} key={q.id}>
                  <Pie
                    data={Object.entries(q.counts).map(([label, value]) => ({ label, value }))}
                    angleField="value"
                    colorField="label"
                    innerRadius={0.4}
                    label={false}
                    height={260}
                  />
                </Card>
              )
            }
            if (q.type === 'rating') {
              return (
                <Card title={q.title} key={q.id}>
                  <span className="block mb-2">{t('data_page.average_score')}：{q.avg.toFixed(2)}</span>
                  <Bar
                    data={q.buckets}
                    xField="score"
                    yField="count"
                    height={260}
                    columnStyle={{ fill: '#1890ff' }}
                  />
                </Card>
              )
            }
            return (
              <Card title={q.title} key={q.id}>
                <div className="max-h-40 overflow-y-auto">
                  {q.samples.map((txt: string, i: number) => (
                    <p key={i} className="border-b pb-1 mb-1 text-gray-600">
                      {txt}
                    </p>
                  ))}
                </div>
              </Card>
            )
          })}

          {/* 展示所有用户自定义字段的统计信息（不展示 department） */}
          {userStats && Object.entries(userStats).map(([key, value]) => {
            if (key === 'department') return null;
            if (!value || typeof value !== 'object' || Object.keys(value).length === 0) return null;
            return (
              <Card title={key} key={key}>
                <Pie
                  data={Object.entries(value).map(([label, num]) => ({
                    label,
                    num,
                  }))}
                  angleField="num"
                  colorField="label"
                  radius={0.8}
                  height={260}
                  label={false}
                />
              </Card>
            );
          })}
        </>
      )}
    </div>
  )
}