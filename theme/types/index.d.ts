import type { DefaultTheme } from 'valaxy'

export interface FriendItem {
  /**
   * 友链名称
   */
  name: string
  /**
   * 友链地址
   */
  link: string
  /**
   * 头像
   */
  avatar?: string
  /**
   * 描述
   */
  description?: string
}

export interface WallpaperConfig {
  /**
   * 亮色模式壁纸
   */
  light?: string
  /**
   * 暗色模式壁纸
   */
  dark?: string
  /**
   * 是否模糊壁纸
   * @default false
   */
  blur?: boolean
}

export interface ThemeConfig extends DefaultTheme.Config {
  colors: {
    primary: string
  }

  footer: {
    since?: number
    icon?: {
      name: string
      animated?: boolean
      color?: string
      url?: string
      title?: string
    }
    powered?: boolean
    beian?: {
      enable?: boolean
      icp?: string
    }
  }

  nav?: NavItem[]
  walineServerURL?: string

  /**
   * 友链应用数据
   */
  friends?: FriendItem[]

  /**
   * 友情链接页面描述
   * @default '这些是我常去的地方'
   */
  friendsDescription?: string

  /**
   * 桌面壁纸配置
   */
  wallpaper?: WallpaperConfig

  /**
   * 文章显示模式
   * - fullscreen：全屏阅读器（列表 | 内容，评论在文章下方）
   * - window：窗口模式，可同时打开多个文章窗口
   * @default 'fullscreen'
   */
  articleDisplayMode?: 'fullscreen' | 'window'

  /**
   * 窗口标题栏样式
   * - mac：macOS 风格（左侧红黄绿按钮）
   * - windows：Windows 风格（右侧最小化/最大化/关闭按钮）
   * @default 'mac'
   */
  windowStyle?: 'mac' | 'windows'

  /**
   * 是否启用浏览器彩蛋
   * @default true
   */
  browserEasterEgg?: boolean

  /**
   * 主题包信息（由 Valaxy 注入）
   */
  pkg?: {
    name?: string
    version?: string
    homepage?: string
    [key: string]: any
  }
}

export interface NavItem {
  text: string
  link: string
  icon?: string
}

export type ThemeUserConfig = Partial<ThemeConfig>

declare module 'valaxy' {
  interface SiteConfig {
    themeConfig?: ThemeConfig
  }
}

export {}
