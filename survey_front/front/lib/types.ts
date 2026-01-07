import type { Survey, Question, Option, Submission, Answer } from '@prisma/client'

// 带问题的问卷类型（包含嵌套的选项）
export type SurveyWithQuestions = Survey & {
  questions: Array<
    Question & {
      options: Option[]
    }
  >,
  userInfoFields: UserInfoField[]
}

// 用户信息字段类型
export type UserInfoField = {
  id: string
  title: string
  type: 'text' | 'email' | 'phone' | 'image'
  required: boolean
  order: number
  placeholder?: string | null
  exampleImage?: string | null
}

// 用户信息类型（与 Zod schema 保持一致）
export interface UserInfo {
  name: string
  phone: string
  email?: string
  department?: string
  [key: string]: string | undefined
}

// 答案记录类型（questionId -> 答案值）
export type AnswersRecord = Record<string, string | string[]>

// 问卷提交结果
export interface SubmissionResult {
  success: boolean
  submissionId?: string
  error?: string
}

// 问卷保存结果
export interface SaveSurveyResult {
  success: boolean
  data?: Survey
  error?: string
}