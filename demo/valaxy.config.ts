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

    footer: {
      since: 2025,
    },
    // themeConfig
    // waline服务端地址
    walineServerURL: 'https://waline.rduteam.top',
  },
})
