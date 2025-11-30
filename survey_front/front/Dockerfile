FROM node:18-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# 依赖安装阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# 仅安装依赖（忽略脚本），避免在依赖阶段触发 postinstall 中的 `prisma generate`，
# 因为此时还没有复制 prisma/schema.prisma，会导致构建失败。
RUN pnpm install --frozen-lockfile --ignore-scripts

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成 Prisma Client（现在 schema 已被复制进来）
RUN pnpm prisma generate

# 构建 Next.js 应用
RUN pnpm build

# 可选：如果不依赖 .next/standalone 的自动裁剪，可在此处执行生产裁剪
# RUN npm prune --production

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]