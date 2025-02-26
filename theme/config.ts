export const AthemeConfig = {
  title: 'Valaxy Theme arona',
  // Gitalk配置
  clientID: 'Ov23liKFZEoHDV4RzRGa',
  clientSecret: '0cd95dbfc62a7b0dbf0032d7c35d23ff1c3e189d',
  repo: 'fingtest6_hlog_comments', // The repository of store comments,
  owner: 'fingtest6',
  admin: ['fingtest6'],
  // links
  links: [
    {
      name: '本站',
      desc: '示例',
      avatar: './favicon.svg',
      link: '/',
    },
    {
      name: '本站',
      desc: '示例2',
      avatar: './favicon.svg',
      link: '/',
    },
    {
      name: '本站',
      desc: '示例3',
      avatar: './favicon.svg',
      link: '/',
    },
  ],
} as const

export type AThemeConfig = typeof AthemeConfig
