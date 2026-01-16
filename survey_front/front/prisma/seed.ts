import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type UserInfoSeed = {
  title: string
  type: string
  required: boolean
  order?: number
  placeholder?: string
  exampleImage?: string
}

type QuestionSeed = {
  title: string
  type: string
  required: boolean
  order?: number
  placeholder?: string
  exampleImage?: string
  options?: string[]
}

type SurveySeed = {
  id: string
  title: string
  qrPath: string
  qrUrl: string
  redirectUrl?: string
  supportButtonText?: string
  supportButtonUrl?: string
  supportCardImage?: string
  userInfoFields: UserInfoSeed[]
  questions: QuestionSeed[]
}

const SURVEYS: SurveySeed[] = [
  {
    id: 'cmjgwrleo000og3zjy00w859y',
    title: 'Dog Allergy Chews',
    qrPath: 'qrcodes/cmjgwrleo000og3zjy00w859y.png',
    qrUrl: 'https://amazoncom-survey.oss-us-west-1.aliyuncs.com/qrcodes/cmjgwrleo000og3zjy00w859y.png',
    redirectUrl: 'https://www.amazon.com/dp/B0DOGALLERGY',
    userInfoFields: [
      { title: 'Full Name', type: 'text', required: true, placeholder: 'Jane Smith' },
      { title: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
      { title: 'Order ID', type: 'text', required: false, placeholder: '123-4567890-1234567' },
    ],
    questions: [
      {
        title: 'How satisfied is your dog after using the allergy chews?',
        type: 'radio',
        required: true,
        options: ['Very satisfied', 'Somewhat satisfied', 'Neutral', 'Not satisfied'],
      },
      {
        title: 'Which symptoms improved?',
        type: 'checkbox',
        required: true,
        options: ['Itching', 'Sneezing', 'Red skin', 'Watery eyes', 'Other'],
      },
      {
        title: 'Additional feedback',
        type: 'text',
        required: false,
        placeholder: 'Tell us more about your experience...'
      },
    ],
  },
  {
    id: 'cmj9ajar50001g3zj3rm35j0r',
    title: 'Neuropathy Relief Cream',
    qrPath: 'qrcodes/cmj9ajar50001g3zj3rm35j0r.png',
    qrUrl: 'https://amazoncom-survey.oss-us-west-1.aliyuncs.com/qrcodes/cmj9ajar50001g3zj3rm35j0r.png',
    redirectUrl: 'https://www.amazon.com/dp/B0NEUROPAIN',
    userInfoFields: [
      { title: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
      { title: 'Email', type: 'email', required: true, placeholder: 'customer@example.com' },
      { title: 'Phone Number', type: 'phone', required: false, placeholder: '+1 555 123 4567' },
    ],
    questions: [
      {
        title: 'How quickly did you feel relief after applying the cream?',
        type: 'radio',
        required: true,
        options: ['Within minutes', 'Within an hour', 'After repeated use', 'No noticeable relief'],
      },
      {
        title: 'Which areas experienced the most improvement?',
        type: 'checkbox',
        required: true,
        options: ['Feet', 'Hands', 'Legs', 'Arms', 'Other'],
      },
      {
        title: 'Describe the sensations before using the cream',
        type: 'text',
        required: false,
        placeholder: 'Burning, tingling, numbness...'
      },
      {
        title: 'Rate your overall comfort level now',
        type: 'rating',
        required: true,
        placeholder: '1 (low) - 5 (high)',
      },
    ],
  },
]

async function seedSurvey(def: SurveySeed, adminId: string) {
  const surveyBase = {
    title: def.title,
    bgImageCover: null,
    bgImageQuestions: null,
    bgImageThanks: null,
    supportCardImage: def.supportCardImage ?? def.qrPath,
    supportButtonText: def.supportButtonText ?? 'View QR Code',
    supportButtonUrl: def.supportButtonUrl ?? def.qrUrl,
    redirectUrl: def.redirectUrl ?? null,
    isActive: true,
    adminId,
  }

  const survey = await prisma.survey.upsert({
    where: { id: def.id },
    update: surveyBase,
    create: {
      id: def.id,
      ...surveyBase,
    },
  })

  await prisma.userInfoField.deleteMany({ where: { surveyId: survey.id } })
  if (def.userInfoFields.length > 0) {
    await prisma.userInfoField.createMany({
      data: def.userInfoFields.map((field, index) => ({
        surveyId: survey.id,
        title: field.title,
        type: field.type,
        required: field.required,
        order: field.order ?? index,
        placeholder: field.placeholder ?? null,
        exampleImage: field.exampleImage ?? null,
      })),
    })
  }

  await prisma.question.deleteMany({ where: { surveyId: survey.id } })
  for (const [index, question] of def.questions.entries()) {
    await prisma.question.create({
      data: {
        surveyId: survey.id,
        title: question.title,
        type: question.type,
        required: question.required,
        order: question.order ?? index,
        placeholder: question.placeholder ?? null,
        exampleImage: question.exampleImage ?? null,
        options: question.options && question.options.length > 0
          ? {
              create: question.options.map((value, optionIndex) => ({
                value,
                order: optionIndex,
              })),
            }
          : undefined,
      },
    })
  }

  console.log(`✅ 问卷 "${survey.title}" 已同步，二维码 ${def.qrUrl}`)
}

async function main() {
  // 优先从环境变量获取密码，否则使用默认强密码
  const password = process.env.ADMIN_PASSWORD ?? 'Admin#ChangeMe123!'
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      role: 'SUPER_ADMIN',
      password: hashedPassword, // 更新密码，确保环境变量生效
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      name: '系统管理员',
      role: 'SUPER_ADMIN',
    },
  })
  
  console.log(`✅ 管理员账号创建成功 (用户名: admin, 密码: ${password})`)

  for (const surveyDef of SURVEYS) {
    await seedSurvey(surveyDef, admin.id)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })