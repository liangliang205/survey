import React, { forwardRef } from 'react'
import { PatternFormat } from 'react-number-format'

interface PhoneInputProps {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  error?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, onBlur, name, error }, ref) => {
    // 移除 "+1 " 前缀，并提取纯数字用于显示，确保格式切换时显示正确
    const rawValue = value && value.startsWith('+1 ') ? value.slice(3) : value
    // 提取纯数字，交给 PatternFormat 重新格式化
    const numericValue = rawValue ? rawValue.replace(/\D/g, '') : ''

    return (
      <div className="flex gap-2 w-full">
        <div className="flex items-center justify-center px-3 border border-[#d9d9d9] rounded-[6px] bg-gray-50 text-gray-500 select-none">
          +1
        </div>
        <div
          className={`
            flex-1 flex items-center px-[11px] py-[4px] border rounded-[6px] transition-all bg-white
            ${
              error
                ? 'border-[#ff4d4f] hover:border-[#ff4d4f] focus-within:border-[#ff4d4f] focus-within:shadow-[0_0_0_2px_rgba(255,38,5,0.06)]'
                : 'border-[#d9d9d9] hover:border-[#4096ff] focus-within:border-[#4096ff] focus-within:shadow-[0_0_0_2px_rgba(5,145,255,0.1)]'
            }
          `}
        >
          <PatternFormat
            getInputRef={ref}
            className="w-full outline-none bg-transparent border-none p-0 text-gray-900 placeholder-gray-400 h-[22px]"
            format="(###) ###-####"
            placeholder="(212) 444-4761"
            name={name}
            value={numericValue}
            onValueChange={(values) => {
              // 只有当有输入数字时才更新值，并加上 +1 前缀
              if (values.value) {
                onChange(`+1 ${values.formattedValue}`)
              } else {
                onChange('')
              }
            }}
            onBlur={onBlur}
          />
        </div>
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'
