import type { ThemeConfig } from 'valaxy-theme-arona'
import { defineConfig } from 'valaxy'

/**
 * User Config
 * do not use export const config to avoid defu conflict
 */
export default defineConfig<ThemeConfig>({
  theme: 'arona',

  themeConfig: {
    // 强调色配置
    // colors: {
    //   primary: 'red',
    // },

    // 文章默认显示模式：'fullscreen' | 'window'
    articleDisplayMode: 'fullscreen',
    // 窗口标题栏默认样式：'mac' | 'windows'
    windowStyle: 'mac',
    // 是否启用浏览器彩蛋
    browserEasterEgg: true,
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
      blur: false,
    },

    footer: {
      since: 2025,
    },
  },
})
