'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SurveyWithQuestions } from '@/lib/types'
import { z } from 'zod'
import { useEffect } from 'react'

export const UserInfoSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  email: z.string().email('邮箱格式不正确').or(z.literal('')).default(''),
  department: z.string().optional(),
})

export type UserInfo = z.infer<typeof UserInfoSchema>

interface SurveyState {
  survey: SurveyWithQuestions
  step: 'cover' | 'userInfo' | 'questions' | 'thanks'
  userInfo: UserInfo
  answers: Record<string, string | string[]>
  currentQuestionIndex: number
  setStep: (step: SurveyState['step']) => void
  setUserInfo: (info: UserInfo) => void
  setAnswer: (questionId: string, value: string | string[]) => void
  nextQuestion: () => void
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      survey: {} as SurveyWithQuestions,
      step: 'cover',
      userInfo: {} as UserInfo,
      answers: {},
      currentQuestionIndex: 0,
      setStep: (step) => set({ step }),
      setUserInfo: (userInfo) => set({ userInfo }),
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
    useSurveyStore.setState({ survey, step: 'cover' })
  }, [survey])
  return <>{children}</>
}