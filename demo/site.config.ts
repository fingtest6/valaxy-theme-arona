import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'zh-CN',
  title: 'Valaxy Theme Arona',
  url: 'https://arona.demo.cjhcjh6.top/',
  author: {
    avatar: 'https://i.postimg.cc/Jn29FGs6/1775401932014.png',
    name: '什亭之人',
  },
  description: 'Valaxy Theme Arona Preview.',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/fingtest6/valaxy-theme-arona',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
  ],
  comment: {
    enable: true,
  },
  themeConfig: {
    colors: {
      primary: '#0070f3',
    },
    nav: [],
    footer: {
      // 页脚配置
      since: 2024,
      powered: true,
    },
    walineServerURL: 'https://waline.rduteam.top',
  },
})
