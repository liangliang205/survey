'use client'

import { useSurveyStore } from './survey-context'
import { Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'

export function ContactSupportCard() {
  const { t } = useTranslation('common')
  const survey = useSurveyStore((state) => state.survey)
  const setStep = useSurveyStore((state) => state.setStep)

  const handleContact = () => {
    setStep('questions')
  }

  const handleClose = () => {
    setStep('thanks')
  }

  return (
    <div
      className="relative min-h-screen p-6 flex items-center justify-center"
      style={{
        backgroundImage: (survey as any).bgImageQuestions
          ? `url(${(survey as any).bgImageQuestions})`
          : (survey as any).bgImage
          ? `url(${(survey as any).bgImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center text-center">
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <CloseOutlined style={{ fontSize: 20 }} />
        </button>
        
        <div className="w-full h-80 relative mb-6 rounded-lg overflow-hidden bg-gray-200">
           {(survey as any).supportCardImage ? (
             <Image 
               src={(survey as any).supportCardImage} 
               alt="Support" 
               fill 
               className="object-cover"
             />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center text-gray-500">
               <span className="text-4xl">📷</span>
             </div>
           )}
        </div>

        <div className="flex flex-col w-full gap-3">
          <Button
            type="primary"
            size="large"
            onClick={handleContact}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {'Contact Support'}
          </Button>
        </div>
      </div>
    </div>
  )
}
