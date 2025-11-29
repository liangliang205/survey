'use client'

import { useLayoutEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { get } from 'lodash'
import { Card, Select, Empty, message, Button } from 'antd'
import { Bar, Line, Pie } from '@ant-design/plots'

import * as XLSX from 'xlsx'

export default function DataPage() {
  const search = useSearchParams()
  const [surveyId, setId] = useState<string | null>(search.get('id'))
  const [data, setData] = useState<any>(null)
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 获取问卷列表
  useLayoutEffect(() => {
    fetch('/api/admin/surveys')
      .then((r) => r.json())
      .then(setSurveys)
      .catch(() => message.error('问卷列表加载失败'))
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
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false))
  }, [surveyId])

  const { totalSubmissions, dailyCount, questionStats, userStats } = data || {}


    // 导出 Excel 方法
    const handleExportExcel = () => {
      if (!data) return message.error('暂无数据可导出')
      const wb = XLSX.utils.book_new()

      // 总提交数和每日统计
      const dailySheet = XLSX.utils.json_to_sheet(
        Object.entries(dailyCount || {}).map(([date, count]) => ({ 日期: date, 提交数: count }))
      )
      XLSX.utils.book_append_sheet(wb, dailySheet, '每日提交')

      // 题目统计
      if (Array.isArray(questionStats)) {
        questionStats.forEach((q: any) => {
          let sheet
          if (q.type === 'radio' || q.type === 'checkbox') {
            sheet = XLSX.utils.json_to_sheet(
              Object.entries(q.counts).map(([label, value]) => ({ 选项: label, 数量: value }))
            )
          } else if (q.type === 'rating') {
            sheet = XLSX.utils.json_to_sheet(q.buckets.map((b: any) => ({ 分数: b.score, 数量: b.count })))
          } else {
            sheet = XLSX.utils.json_to_sheet(q.samples.map((txt: string, i: number) => ({ 序号: i + 1, 内容: txt })))
          }
          XLSX.utils.book_append_sheet(wb, sheet, q.title)
        })
      }

      // 部门分布
      if (userStats?.department) {
        const deptSheet = XLSX.utils.json_to_sheet(
          Object.entries(userStats.department).map(([dept, num]) => ({ 部门: dept, 数量: num }))
        )
        XLSX.utils.book_append_sheet(wb, deptSheet, '部门分布')
      }

      XLSX.writeFile(wb, `问卷数据_${surveyId}.xlsx`)
    }

    return (
      <div className="space-y-6">
        <div className="flex gap-4 items-center mb-2">
          <Select
            placeholder="请选择要查看的问卷"
            style={{ width: 300 }}
            value={surveyId}
            onChange={setId}
            loading={surveys.length === 0}
            allowClear
            notFoundContent={surveys.length === 0 ? '加载中...' : '暂无问卷'}
          >
            {surveys.map((s: any) => (
              <Select.Option key={s.id} value={s.id}>{s.title}</Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleExportExcel} disabled={!data}>
            导出 Excel
          </Button>
        </div>

        {!surveyId ? (
          <Empty description="未选择问卷" />
        ) : loading ? (
          <div className="text-gray-400">数据加载中...</div>
        ) : (
          <>
            <Card title={`总提交数：${totalSubmissions}`}>
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
                    <span className="block mb-2">平均分：{q.avg.toFixed(2)}</span>
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

            <Card title="部门分布">
              <Pie
                data={Object.entries(userStats?.department || {}).map(([dept, num]) => ({
                  dept,
                  num,
                }))}
                angleField="num"
                colorField="dept"
                radius={0.8}
                height={260}
                label={false}
              />
            </Card>
          </>
        )}
      </div>
    )
}
