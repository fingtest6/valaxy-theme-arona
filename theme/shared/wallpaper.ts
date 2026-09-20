import type { WallpaperConfig, WallpaperWebConfig } from '../types'

/**
 * 生产环境生成的 Service Worker 文件名
 * 需要与客户端注册、构建端写入保持一致
 */
export const WALLPAPER_WEB_SW_FILENAME = '__arona_wallpaper_sw__.js'

const DEFAULT_WALLPAPER_WEB_DIR = 'wallpaper'

/** requestIdleCallback 默认最长等待时间（ms），与主题默认配置共用 */
export const DEFAULT_WALLPAPER_WEB_IDLE_TIMEOUT = 1500

export interface ResolvedWallpaperWebConfig {
  enable: boolean
  url: string
  dir: string | false
  mobile: boolean
  idleTimeout: number
  cache: boolean
  interactive: boolean
}

/**
 * 规范化网页壁纸目录
 *
 * - 统一分隔符为 `/`
 * - 去掉开头的 `./` 与两侧多余 `/`
 */
function normalizeWallpaperDir(dir: string): string {
  return dir
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .replace(/\/+$/, '')
}

/**
 * 解析网页壁纸配置，客户端与构建端共用同一套默认值
 */
export function resolveWallpaperWebOptions(wallpaper?: WallpaperConfig | null): ResolvedWallpaperWebConfig {
  const raw: WallpaperWebConfig = wallpaper?.web || {}
  const dir = raw.dir === undefined ? DEFAULT_WALLPAPER_WEB_DIR : raw.dir
  const normalizedDir = typeof dir === 'string' && dir.trim()
    ? normalizeWallpaperDir(dir)
    : false

  let url = raw.url?.trim() || ''
  if (!url && normalizedDir)
    url = `/${normalizedDir}/index.html`

  return {
    enable: !!raw.enable,
    url,
    dir: normalizedDir,
    mobile: !!raw.mobile,
    idleTimeout: typeof raw.idleTimeout === 'number' && raw.idleTimeout >= 0
      ? raw.idleTimeout
      : DEFAULT_WALLPAPER_WEB_IDLE_TIMEOUT,
    cache: !!raw.cache,
    interactive: raw.interactive === undefined ? true : !!raw.interactive,
  }
}

/**
 * 是否为外部 URL
 */
export function isExternalWallpaperUrl(url: string): boolean {
  return /^(?:https?:)?\/\//.test(url) || url.startsWith('data:')
}
