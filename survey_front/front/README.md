# Survey System (问卷调查系统)

这是一个基于 Next.js 14 构建的现代化问卷调查系统，支持问卷创建、管理、发布及数据收集。系统集成了阿里云 OSS 存储、国际化 (i18n) 支持以及完善的后台管理功能。

## ✨ 主要功能

*   **问卷管理**：创建、编辑、删除问卷，支持多种题型（单选、多选、文本、评分）。
*   **可视化编辑器**：直观的问卷编辑器，支持拖拽排序、实时预览。
*   **个性化设置**：支持自定义封面图、背景图（首页、内容页、感谢页）、支持卡片图片。
*   **图片存储**：集成阿里云 OSS，所有上传的图片直接存储在云端，无需占用本地服务器空间。
*   **多语言支持**：后台管理界面支持中英文切换 (i18n)。
*   **数据收集**：实时收集用户提交的问卷数据。
*   **二维码生成**：自动生成问卷推广二维码。
*   **系统设置**：支持配置系统名称、描述、Logo 等信息。
*   **响应式设计**：完美适配桌面端和移动端。

## 🛠️ 技术栈

*   **框架**: [Next.js 14](https://nextjs.org/) (App Router)
*   **语言**: TypeScript
*   **UI 组件库**: [Ant Design](https://ant.design/)
*   **样式**: [Tailwind CSS](https://tailwindcss.com/)
*   **数据库 ORM**: [Prisma](https://www.prisma.io/)
*   **数据库**: SQLite (默认) / PostgreSQL (生产环境推荐)
*   **认证**: NextAuth.js
*   **存储**: 阿里云 OSS (Aliyun Object Storage Service)
*   **国际化**: next-i18next / react-i18next

## 🚀 本地开发指南

### 1. 环境准备
确保本地已安装 Node.js (v18+) 和 pnpm。

### 2. 安装依赖
```bash
pnpm install
```

### 3. 配置环境变量
复制 `.env.example` 为 `.env` 并填入必要信息：

```env
# 数据库连接 (默认使用 SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key" # 使用 `openssl rand -base64 32` 生成

# 阿里云 OSS 配置 (必须配置，否则无法上传图片)
OSS_REGION="oss-cn-hangzhou"
OSS_ACCESS_KEY_ID="your_access_key_id"
OSS_ACCESS_KEY_SECRET="your_access_key_secret"
OSS_BUCKET="your_bucket_name"

# 上传限制
NEXT_PUBLIC_MAX_UPLOAD_SIZE="5242880" # 5MB
```

### 4. 数据库迁移与填充
```bash
# 生成 Prisma Client
pnpm prisma generate

# 执行数据库迁移
pnpm prisma migrate dev

# 填充初始数据 (默认管理员账号)
pnpm db:seed
```

### 5. 启动开发服务器
```bash
pnpm dev
```
访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 📦 部署指南

### 方式一：使用 Docker Compose (通用)

1.  **构建镜像**
    ```bash
    docker compose build
    ```

2.  **启动服务**
    ```bash
    docker compose up -d
    ```

3.  **初始化数据库** (首次运行)
    ```bash
    docker compose run --rm migrate
    ```

### 方式二：使用 1Panel 部署 (推荐)

本项目提供了专为 1Panel 适配的配置文件 `docker-compose.1panel.yml`。

1.  **创建应用**
    *   在 1Panel 面板中进入“容器” -> “编排” -> “创建编排”。
    *   将 `docker-compose.1panel.yml` 的内容复制进去。

2.  **配置环境变量**
    *   **关键**：务必在 1Panel 的环境变量设置中填入正确的阿里云 OSS 配置 (`OSS_REGION`, `OSS_ACCESS_KEY_ID`, `OSS_ACCESS_KEY_SECRET`, `OSS_BUCKET`)。
    *   修改 `NEXTAUTH_URL` 为你的实际域名。

3.  **挂载卷**
    *   确保 `survey_sqlite_data` 卷已正确创建，用于持久化 SQLite 数据库文件。

4.  **初始化**
    *   部署完成后，在编排列表中找到 `migrate` 服务并点击“启动”，等待运行完成后即可停止。这将自动执行数据库迁移和种子数据填充。

## 📂 目录结构

```
.
├── action/             # Server Actions (业务逻辑)
├── app/                # Next.js App Router 页面路由
│   ├── admin/          # 后台管理页面
│   ├── api/            # API 路由
│   └── s/              # 问卷填写端页面
├── components/         # React 组件
│   ├── admin/          # 后台专用组件
│   └── survey/         # 问卷展示组件
├── lib/                # 工具函数 (OSS, Prisma, Auth 等)
├── prisma/             # 数据库模型与迁移文件
├── public/             # 静态资源
└── types/              # TypeScript 类型定义
```

## 📝 注意事项

*   **OSS 依赖**：本项目已移除本地文件存储功能，所有图片上传均依赖阿里云 OSS，请确保配置正确。
*   **构建优化**：已针对 `vm2` 和 `coffee-script` 依赖问题进行了 Webpack 配置优化，确保构建顺利。
*   **字体优化**：`next.config.js` 中禁用了自动字体优化以避免某些网络环境下的构建错误。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

### 4) Start app
```powershell
docker compose up -d
```

### 5) Check logs and open
```powershell
docker compose logs -f survey-app
```
Visit http://localhost:3000

Default admin account (from seed):
- Username: `admin`
- Password: `admin123`

### Notes
- Volumes persisted locally: `sqlite_data` (SQLite DB), `uploads` (uploaded files), `qrcodes` (generated QR images).
- Change `NEXTAUTH_SECRET` in `docker-compose.yml` or copy `.env.example` to `.env` and set your own values for local use.
