// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    formatters: true,
  },
  {
    ignores: [
      // 第三方安装的 Agent Skills，不属于主题源码
      '.agents/**',
      '**/*/.valaxy',
      'demo/wallpaper/**',
      // 构建产物（valaxy rss / fuse 索引生成的 json）
      'demo/public/feed.json',
      'demo/public/valaxy-fuse-list.json',
    ],
  },
)
