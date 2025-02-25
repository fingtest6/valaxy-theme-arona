import { defineConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-arona'

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
        text: '文章',
        link: '/allposts',
      },
      {
        text: '友情链接',
        link: '/link',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/fingtest6/valaxy-theme-arona',
      },
      {
        text: 'Valaxy →',
        link: 'https://github.com/YunYouJun/valaxy',
      },
    ],

    footer: {
      since: 2024,
    },
  },
})
