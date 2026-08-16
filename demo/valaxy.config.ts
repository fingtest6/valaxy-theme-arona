import type { ThemeConfig } from 'valaxy-theme-arona'
import { defineConfig } from 'valaxy'

/**
 * User Config
 * do not use export const config to avoid defu conflict
 */
export default defineConfig<ThemeConfig>({
  theme: 'arona',

  themeConfig: {
    // colors: {
    //   primary: 'red',
    // },

    nav: [
      {
        text: 'GitHub',
        link: 'https://github.com/fingtest6/valaxy-theme-arona',
      },
      {
        text: 'RSS',
        link: 'https://arona.demo.cjhcjh6.top/atom.xml',
      },
      {
        text: 'Valaxy →',
        link: 'https://github.com/YunYouJun/valaxy',
      },
    ],

    // 友链应用数据
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
