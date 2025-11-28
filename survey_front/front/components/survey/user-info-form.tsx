
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from 'antd'
import { UserInfoSchema, type UserInfo } from './survey-context'
import { useSurveyStore } from './survey-context'

export function UserInfoForm() {
  const setStep = useSurveyStore((state) => state.setStep)
  const setUserInfo = useSurveyStore((state) => state.setUserInfo)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInfo>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      department: '',
    },
  })

  const onSubmit = (data: UserInfo) => {
    setUserInfo(data)
    setStep('questions')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-6">个人信息</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label>姓名</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="请输入姓名" />
              )}
            />
            {errors.name && <div style={{ color: 'red' }}>{errors.name.message}</div>}
          </div>
          <div className="mb-4">
            <label>手机号</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="请输入手机号" />
              )}
            />
            {errors.phone && <div style={{ color: 'red' }}>{errors.phone.message}</div>}
          </div>
          <div className="mb-4">
            <label>邮箱（选填）</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="请输入邮箱" />
              )}
            />
            {errors.email && <div style={{ color: 'red' }}>{errors.email.message}</div>}
          </div>
          <div className="mb-4">
            <label>部门（选填）</label>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="请输入部门" />
              )}
            />
          </div>
          <Button type="primary" htmlType="submit" block size="large">
            下一步
          </Button>
        </form>
      </div>
    </div>
  )
}