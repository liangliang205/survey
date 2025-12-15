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
        backgroundImage: (survey as any).bgImageCover
          ? `url(${(survey as any).bgImageCover})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full flex justify-center pb-24">
        <Button
          size="large"
          className="w-[380px] py-8 text-4xl font-bold tracking-widest rounded-full transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'rgba(255, 255, 255, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.40)',
            boxShadow:
              '0 8px 32px 0 rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0,0,0,0.25)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(255, 255, 255, 0.30)'
            el.style.border = '1px solid rgba(255, 255, 255, 0.55)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(255, 255, 255, 0.22)'
            el.style.border = '1px solid rgba(255, 255, 255, 0.40)'
          }}
          onClick={() => {
            if ((survey as any).redirectUrl) {
              window.location.href = (survey as any).redirectUrl
            } else {
              setStep('userInfo')
            }
          }}
        >
          {t('start_filling')}
        </Button>
      </div>
    </div>
  )
}