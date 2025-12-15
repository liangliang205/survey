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
    window.close()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative min-h-screen p-6 flex items-center justify-center"
      style={{
        backgroundImage: (survey as any).bgImageThanks
          ? `url(${(survey as any).bgImageThanks})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
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
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            block
            size="large"
            onClick={handleBackToHome}
            className="bg-gradient-to-r from-blue-500/80 to-indigo-500/80 text-white backdrop-blur-md hover:from-blue-500 hover:to-indigo-600 transition-colors duration-300 border-0"
          >
            {t('back_to_home')}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}