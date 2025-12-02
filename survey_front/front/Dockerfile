FROM node:18-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# 依赖安装阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl su-exec
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# 仅安装依赖（忽略脚本），避免在依赖阶段触发 postinstall 中的 `prisma generate`，
# 因为此时还没有复制 prisma/schema.prisma，会导致构建失败。
RUN pnpm install --frozen-lockfile --ignore-scripts

# 构建阶段
FROM base AS builder
WORKDIR /app
ENV CI=true
RUN apk add --no-cache libc6-compat openssl
COPY . .

# 由于 pnpm 使用全局 store + 硬链接/符号链接，仅复制 node_modules 会导致链接失效。
# 在构建阶段重新安装依赖以保证 CLI 可用（同时仍保留上游 deps 层供缓存加速）。
RUN pnpm install --frozen-lockfile --ignore-scripts

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
RUN apk add --no-cache libc6-compat openssl

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma


# 确保 qrcodes 目录的所有权属于运行应用的用户
RUN chown -R nextjs:nodejs /app/public/qrcodes
RUN chown -R nextjs:nodejs /app/public/uploads

# 拷贝并设置入口脚本用于修正卷权限
COPY --from=builder /app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER root

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]