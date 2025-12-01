// prisma.config.ts

const config = {
  earlyAccess: true, // 必须开启，因为 SQLite adapter 目前是早期访问功能
  datasource: {
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL!, // 直接读取环境变量
    },
  },
}

export default config