import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 生产环境建议同时设置环境变量 AUTH_URL，或在反代正确传递 Host/Proto
  // 这里开启 trustHost 以避免 UntrustedHost 错误（仍建议配置 AUTH_URL）
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username as string },
        })

        if (!admin) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password as string, admin.password)
        
        if (!isValid) {
          return null
        }

        // 登录成功，更新 loginVersion
        const updatedAdmin = await prisma.admin.update({
          where: { id: admin.id },
          data: { loginVersion: { increment: 1 } },
        })

        return {
          id: updatedAdmin.id,
          name: updatedAdmin.name || updatedAdmin.username,
          email: updatedAdmin.username,
          loginVersion: updatedAdmin.loginVersion,
          role: updatedAdmin.role,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 初始登录
      if (user) {
        token.id = user.id
        token.loginVersion = (user as any).loginVersion
        token.role = (user as any).role
      }

      // 每次请求检查数据库中的 loginVersion
      if (token.id) {
        const admin = await prisma.admin.findUnique({
          where: { id: token.id as string },
          select: { loginVersion: true, role: true },
        })

        // 如果数据库中的版本号与 token 中的不一致，说明有新的登录
        if (!admin || admin.loginVersion !== token.loginVersion) {
          return null // 这会导致 session 失效
        }
        
        // 更新 role，防止数据库修改后 session 中还是旧的
        token.role = admin.role
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        // @ts-ignore
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
})