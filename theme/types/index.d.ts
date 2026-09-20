import type { DefaultTheme } from 'valaxy'

import type { AppsConfig } from '../shared/apps'

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

export interface NoteItem {
  /**
   * 相对 notes 目录的 slug
   */
  slug: string
  /**
   * 笔记标题
   */
  title: string
  /**
   * 日期
   */
  date?: string
  /**
   * 标签
   */
  tags: string[]
  /**
   * 渲染后的 HTML
   */
  html: string
}

export interface AlbumPhoto {
  /**
   * 图片 URL（由 Vite 处理后的资源地址）
   */
  src: string
  /**
   * 图片标题
   */
  title: string
  /**
   * 图片描述
   */
  description: string
  /**
   * 相对 photos 目录的文件名
   */
  filename: string
  /**
   * 是否为外部 URL 图片
   */
  external?: boolean
  /**
   * 是否为用户在相册中运行时添加的外链
   */
  runtime?: boolean
  /**
   * 文件大小（字节，外链为空）
   */
  size?: number
  /**
   * 最后修改时间戳（外链为空）
   */
  mtime?: number
}

export interface AlbumData {
  /**
   * 相册标题
   */
  title: string
  /**
   * 相册描述
   */
  description: string
  /**
   * 图片列表
   */
  photos: AlbumPhoto[]
}
export interface FileEntry {
  folder: 'posts' | 'notes'
  name: string
  relativePath: string
  type: 'markdown'
  size: number
  mtime: number
  routePath?: string
  slug?: string
}

export interface FilesData {
  posts: FileEntry[]
  notes: FileEntry[]
}

export interface WallpaperWebConfig {
  /**
   * 是否启用网页壁纸
   * @default false
   */
  enable?: boolean
  /**
   * 网页壁纸入口地址
   *
   * - 站内路径请以 `/` 开头，会自动拼接 Vite base
   * - 未设置时根据 `dir` 推断为 `/<dir>/index.html`
   * - 外部 URL 请设置 `dir: false`，避免复制本地资源
   */
  url?: string
  /**
   * 网页壁纸资源目录（相对项目根目录）
   *
   * - 开发环境：挂载为静态目录
   * - 构建环境：复制到 `dist/<dir>`
   * - 设为 `false` 表示资源已在 public 中或使用外部 URL，不做复制
   *
   * @default 'wallpaper'
   */
  dir?: string | false
  /**
   * 移动端是否加载网页壁纸
   *
   * WebGL / 重资源网页在移动端体验较差，默认关闭
   * @default false
   */
  mobile?: boolean
  /**
   * requestIdleCallback 的最长等待时间（ms）
   * @default 1500
   */
  idleTimeout?: number
  /**
   * 生产环境是否生成并注册 Service Worker，缓存网页壁纸资源
   *
   * 仅对同源、本地目录的网页壁纸生效
   * @default false
   */
  cache?: boolean
  /**
   * 是否允许鼠标与网页壁纸交互
   *
   * 默认开启：点击网页壁纸可与其交互，桌面窗口仍可正常操作
   * 设为 false 时点击穿透到桌面
   * @default true
   */
  interactive?: boolean
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
  /**
   * 网页壁纸配置
   */
  web?: WallpaperWebConfig
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
   * - fullscreen：全屏阅读器（列表 / 内容，评论在文章下方）
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
   * 新增桌面 App 开关
   */
  apps?: AppsConfig
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
