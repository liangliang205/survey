'use client'

import Image from 'next/image'
import { useSurveyStore } from './survey-context'
import { Button } from 'antd'

export function CoverPage() {
  const survey = useSurveyStore((state) => state.survey)
  const setStep = useSurveyStore((state) => state.setStep)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {survey.bgImage && (
          <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
            <Image
              src={survey.bgImage}
              alt={survey.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{survey.title}</h1>
        {survey.description && (
          <p className="text-gray-600 mb-8">{survey.description}</p>
        )}
        <Button
          type="primary"
          size="large"
          block
          onClick={() => setStep('userInfo')}
        >
          开始填写
        </Button>
      </div>
    </div>
  )
}