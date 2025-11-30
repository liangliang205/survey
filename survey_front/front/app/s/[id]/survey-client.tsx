'use client'

import { useSurveyStore } from '@/components/survey/survey-context'
import { CoverPage } from '@/components/survey/cover-page'
import { UserInfoForm } from '@/components/survey/user-info-form'
import { UserInfoDynamicForm } from '@/components/survey/user-info-dynamic-form'
import { QuestionPage } from '@/components/survey/question-page'
import { ThanksPage } from '@/components/survey/thanks-page'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'

const STEPS = ['cover', 'userInfo', 'questions', 'thanks'] as const

export default function SurveyClient() {
  const step = useSurveyStore((state) => state.step)
  const survey = useSurveyStore((state) => state.survey)
  
  // 确保初始状态正确设置
  useEffect(() => {
    if (!survey || Object.keys(survey).length === 0) {
      useSurveyStore.setState({ step: 'cover' })
    }
  }, [survey])

  const renderStep = () => {
    switch (step) {
      case 'cover':
        return <CoverPage />
      case 'userInfo':
        // 如果有自定义用户信息字段则使用动态表单，否则使用默认表单
        return survey.userInfoFields && survey.userInfoFields.length > 0 
          ? <UserInfoDynamicForm /> 
          : <UserInfoForm />
      case 'questions':
        return <QuestionPage />
      case 'thanks':
        return <ThanksPage />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  )
}