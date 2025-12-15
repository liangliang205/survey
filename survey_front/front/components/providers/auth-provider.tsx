'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { message } from 'antd'

function SessionWatcher() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 如果状态变为未认证，且当前在管理后台，则跳转登录
    if (status === 'unauthenticated' && pathname?.startsWith('/admin')) {
      message.warning('登录已过期或账号在其他设备登录，请重新登录')
      router.push('/login')
    }
  }, [status, pathname, router])

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={10} // 每10秒检查一次 Session 状态
      refetchOnWindowFocus={true} // 窗口聚焦时检查
    >
      <SessionWatcher />
      {children}
    </SessionProvider>
  )
}