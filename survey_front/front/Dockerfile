FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# 启用 pnpm
RUN corepack enable

# 1. 依赖安装阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# 复制依赖定义文件
COPY package.json pnpm-lock.yaml ./
# 复制 Prisma Schema，以便 postinstall 钩子能正常运行 prisma generate
COPY prisma ./prisma

# 安装依赖
# --frozen-lockfile: 确保 lock 文件不被修改
# 注意：这里不再使用 --ignore-scripts，让 postinstall (prisma generate) 正常执行
# 这样生成的 Client 会被缓存，后续步骤无需重复生成
RUN pnpm install --frozen-lockfile

# 2. 构建阶段
FROM base AS builder
WORKDIR /app
ENV CI=true
# 增加 Node.js 内存限制，防止构建时内存溢出
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN apk add --no-cache libc6-compat openssl

# 从 deps 阶段复制已安装的 node_modules 和生成的 prisma client
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# 构建 Next.js 应用
# 此时 node_modules 已就绪且包含 Prisma Client，直接构建即可
RUN pnpm build

# 3. 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# 禁用 Next.js 遥测
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 安装运行时必要的系统库（如 Prisma 引擎需要的 openssl）和 su-exec（用于降权）
RUN apk add --no-cache libc6-compat openssl su-exec

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
# 1. 复制 public 目录（静态资源）
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 2. 复制 standalone 输出（包含最小化运行时依赖和 server.js）
# 注意：Next.js 的 standalone 输出会自动包含必要的 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 3. 复制静态资源（.next/static 必须手动复制，standalone 不包含它）
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4. 复制 Prisma Schema 和迁移文件（用于运行时迁移或种子数据）
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 5. 复制入口脚本
COPY --from=builder /app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 预创建挂载点并设置权限，防止 Docker 自动创建为 root 权限
RUN mkdir -p /app/public/uploads /app/public/qrcodes && \
    chown -R nextjs:nodejs /app/public/uploads /app/public/qrcodes

# 暴露端口
EXPOSE 3000

# 使用 root 启动入口脚本，以便在脚本中执行 chown 修复卷权限，
# 然后在脚本最后通过 su-exec 切换回 nextjs 用户运行应用
USER root

ENTRYPOINT ["/entrypoint.sh"]