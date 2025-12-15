/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用自动字体优化以解决字体模块错误
  optimizeFonts: false,
  // 生成可在 Docker 运行时复制的独立产物（.next/standalone）
  output: 'standalone',
  
  // 添加国际化配置（保持 Next.js 支持的字段，移除无效 defaultNS/ns）
  i18n: {
    locales: ['en', 'zh-CN'],
    defaultLocale: 'zh-CN',
    localeDetection: false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.aliyuncs.com',
      },
    ],
  }
  
  // 添加重写规则，避免.locale文件请求出现双重扩展名
  // 删除原有的重写规则，因为它们会导致文件路径重复添加.json扩展名
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/locales/:lng/:ns',
  //       destination: '/api/locales/:lng/:ns.json'
  //     }
  //   ]
  // }
}

module.exports = nextConfig