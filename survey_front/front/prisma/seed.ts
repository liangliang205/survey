import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 优先从环境变量获取密码，否则使用默认强密码
  const password = process.env.ADMIN_PASSWORD || 'SurveyAdmin@2025!'
  const hashedPassword = await bcrypt.hash(password, 10)
  
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      role: 'SUPER_ADMIN'
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      name: '系统管理员',
      role: 'SUPER_ADMIN',
    },
  })
  
  console.log(`✅ 管理员账号创建成功 (用户名: admin, 密码: ${password})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })