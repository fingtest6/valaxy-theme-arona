// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    formatters: true,
  },
  {
    ignores: [
      '**/*/.valaxy',
      // 构建产物（valaxy rss / fuse 索引生成的 json）
      'demo/public/feed.json',
      'demo/public/valaxy-fuse-list.json',
    ],
  },
)
