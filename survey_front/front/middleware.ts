import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 检查 session token
  // NextAuth v5 使用 'authjs.session-token' (http) 或 '__Secure-authjs.session-token' (https)
  const token = request.cookies.get('authjs.session-token')?.value || 
                request.cookies.get('__Secure-authjs.session-token')?.value

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  // 1. 未登录且访问管理后台 -> 重定向到登录页
  if (isAdminPage && !token) {
    const url = new URL('/login', request.url)
    // 记录原本想访问的页面，登录后跳转回来
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 2. 已登录且访问登录页 -> 重定向到管理后台首页
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // 匹配 /admin 下的所有路径，以及 /login 页面
  matcher: ['/admin/:path*', '/login'],
}