'use client'

import { Button } from 'antd'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSurveyStore } from './survey-context'
import { useTranslation } from 'next-i18next'

export function ThanksPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const survey = useSurveyStore((state) => state.survey)

  const handleBackToHome = () => {
    // 清除本地存储的问卷数据
    localStorage.removeItem('survey-storage')
    router.push('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('submission_success')}</h2>
            <p className="text-gray-600 mb-6">
              {survey?.title ? t('thank_you_for_participation_with_title', { title: survey.title }) : t('thank_you_for_participation')}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button type="primary" block size="large" onClick={handleBackToHome}>
            {t('back_to_home')}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}