import type { ThemeConfig } from 'valaxy-theme-arona'
import { defineConfig } from 'valaxy'

/**
 * User Config
 * do not use export const config to avoid defu conflict
 */
export default defineConfig<ThemeConfig>({
  theme: 'arona',

  themeConfig: {
    // Waline 评论服务地址
    walineServerURL: 'https://waline.rduteam.top',
    // 友情链接描述
    friendsDescription: '这里是友链',
    // 文章默认显示模式：'fullscreen' | 'window'
    articleDisplayMode: 'fullscreen',
    // 窗口标题栏默认样式：'mac' | 'windows'
    windowStyle: 'mac',
    // 是否启用浏览器彩蛋
    browserEasterEgg: true,

    // 部分App开关  文件 笔记 相册
    apps: {
      files: true,
      notes: true,
      album: true,
    },

    // 友情链接设置
    friends: [
      {
        name: 'Valaxy',
        link: 'https://valaxy.site',
        avatar: 'https://valaxy.site/valaxy-logo.png',
        description: 'Next Generation Static Blog Framework.',
      },
      {
        name: 'Vue.js',
        link: 'https://cn.vuejs.org',
        avatar: 'https://cn.vuejs.org/logo.svg',
        description: '渐进式 JavaScript 框架',
      },
      {
        name: 'Vite',
        link: 'https://cn.vitejs.dev',
        avatar: 'https://cn.vitejs.dev/logo.svg',
        description: '下一代前端构建工具',
      },
    ],
    wallpaper: {
      // 静态图片兜底（网页壁纸加载前显示）
      blur: false,
      // 网页壁纸：资源目录为 demo/wallpaper（不在 public，禁用后不会输出）
      web: {
        enable: false,
        // 生产环境注册 Service Worker，二次访问秒开
        cache: true,
        // 网页壁纸可交互（默认开启），窗口仍可正常操作
        interactive: true,
      },
    },

    footer: {
      since: 2025,
    },
  },
})
