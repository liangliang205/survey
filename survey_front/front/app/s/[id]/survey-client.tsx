'use client'

import { useSurveyStore } from '@/components/survey/survey-context'
import { CoverPage } from '@/components/survey/cover-page'
import { UserInfoForm } from '@/components/survey/user-info-form'
import { QuestionPage } from '@/components/survey/question-page'
import { ThanksPage } from '@/components/survey/thanks-page'
import { AnimatePresence, motion } from 'framer-motion'

const STEPS = ['cover', 'userInfo', 'questions', 'thanks'] as const

export default function SurveyClient() {
  const step = useSurveyStore((state) => state.step)
  
  const renderStep = () => {
    switch (step) {
      case 'cover':
        return <CoverPage />
      case 'userInfo':
        return <UserInfoForm />
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