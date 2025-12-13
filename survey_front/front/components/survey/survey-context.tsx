'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SurveyWithQuestions, UserInfo } from '@/lib/types'
import { z } from 'zod'
import { useEffect } from 'react'
import { useTranslation } from 'next-i18next'


// 创建一个函数来返回带翻译的 schema，而不是直接定义它
export const getUserInfoSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t('name_min_length')),
  phone: z.string().regex(/^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/, t('invalid_phone_format')),
  email: z.string().email(t('invalid_email_format')).or(z.literal('')).default(''),
  department: z.string().optional(),
}).catchall(z.string().optional())

export type UserInfoType = UserInfo & Record<string, string | undefined>

interface SurveyState {
  survey: SurveyWithQuestions
  step: 'cover' | 'userInfo' | 'contactSupport' | 'questions' | 'thanks'
  userInfo: UserInfoType
  submissionId: string | null
  answers: Record<string, string | string[]>
  currentQuestionIndex: number
  setStep: (step: SurveyState['step']) => void
  setUserInfo: (info: UserInfoType) => void
  setSubmissionId: (id: string) => void
  setAnswer: (questionId: string, value: string | string[]) => void
  nextQuestion: () => void
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      survey: {} as SurveyWithQuestions,
      step: 'cover',
      userInfo: {} as UserInfoType,
      submissionId: null,
      answers: {},
      currentQuestionIndex: 0,
      setStep: (step) => set({ step }),
      setUserInfo: (userInfo) => set({ userInfo }),
      setSubmissionId: (submissionId) => set({ submissionId }),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),
    }),
    {
      name: 'survey-storage',
      partialize: (state) => ({
        answers: state.answers,
        userInfo: state.userInfo,
        currentQuestionIndex: state.currentQuestionIndex,
        step: state.step, // 添加step状态的持久化，确保刷新后仍能保持当前步骤
      }),
    }
  )
)

export function SurveyProvider({
  children,
  survey,
}: {
  children: React.ReactNode
  survey: SurveyWithQuestions
}) {
  useEffect(() => {
    // 只有当survey改变时才更新survey数据，但不重置step
    useSurveyStore.setState({ survey })
  }, [survey])
  return <>{children}</>
}