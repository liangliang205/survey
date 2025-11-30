'use client'

import Image from 'next/image'
import { useSurveyStore } from './survey-context'
import { Button } from 'antd'
import { useTranslation } from 'next-i18next'

export function CoverPage() {
  const { t } = useTranslation('common')
  const survey = useSurveyStore((state) => state.survey)
  const setStep = useSurveyStore((state) => state.setStep)

  return (
    <div
      className="relative min-h-screen w-full flex items-end justify-center"
      style={{
        backgroundImage: survey.bgImage ? `url(${survey.bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full flex justify-center pb-24">
        <Button
          type="primary"
          size="large"
          className="w-[320px] py-7 text-3xl font-bold tracking-widest rounded-full shadow-lg"
          onClick={() => setStep('userInfo')}
        >
          {t('start_filling')}
        </Button>
      </div>
    </div>
  )
}