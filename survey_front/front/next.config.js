/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用自动字体优化以解决字体模块错误
  optimizeFonts: false,
  
  // 添加国际化配置
  i18n: {
    locales: ['en', 'zh-CN'], // 支持的语言列表
    defaultLocale: 'en',      // 默认语言
    // 指定默认 namespace
    defaultNS: 'common',
    ns: ['common'],
    localeDetection: false // 禁用自动检测，避免 zh 转换问题
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