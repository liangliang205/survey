import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as ExcelJS from 'exceljs'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const surveyId = req.nextUrl.searchParams.get('surveyId')
  if (!surveyId) {
    return NextResponse.json({ error: 'Missing surveyId' }, { status: 400 })
  }

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { options: true },
      },
      submissions: {
        include: {
          answers: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!survey) {
    return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
  }

  // 创建 Excel
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('问卷数据')

  // 表头
  const headers = ['提交时间', '姓名', '手机号', '邮箱', '部门']
  const questionHeaders = survey.questions.map((q) => q.title)
  worksheet.addRow([...headers, ...questionHeaders])

  // 数据行
  survey.submissions.forEach((submission) => {
    const userInfo = JSON.parse(submission.userInfo)
    const rowData = [
      submission.createdAt.toLocaleString('zh-CN'),
      userInfo.name || '',
      userInfo.phone || '',
      userInfo.email || '',
      userInfo.department || '',
    ]

    survey.questions.forEach((question) => {
      const answer = submission.answers.find((a) => a.questionId === question.id)
      let answerValue = answer?.value || ''
      
      // 如果是多选，解析 JSON
      if (question.type === 'checkbox' && answerValue) {
        try {
          const values = JSON.parse(answerValue)
          answerValue = values.join(', ')
        } catch {}
      }
      
      rowData.push(answerValue)
    })

    worksheet.addRow(rowData)
  })

  // 自动列宽
  worksheet.columns.forEach((column) => {
    let maxLength = 0
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 0
      maxLength = Math.max(maxLength, cellLength)
    })
    column.width = maxLength < 10 ? 10 : maxLength
  })

  // 流式返回
  const buffer = await workbook.xlsx.writeBuffer()
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(survey.title)}_${Date.now()}.xlsx"`,
    },
  })
}