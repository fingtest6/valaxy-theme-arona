import type { Plugin } from 'vite'
import type { ThemeConfig } from '../types'
import { DEFAULT_WALLPAPER_WEB_IDLE_TIMEOUT } from '../shared/wallpaper'

export { createAppsPlugin, writeAppRedirects } from './apps'

export { createWallpaperPlugin } from './wallpaper'

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  walineServerURL: '',
  valaxyDarkOptions: {
    circleTransition: true,
  },

  colors: {
    primary: '#0078E7',
  },

  friends: [],
  friendsDescription: '这些是我常去的地方',

  wallpaper: {
    blur: false,
    web: {
      enable: false,
      mobile: false,
      idleTimeout: DEFAULT_WALLPAPER_WEB_IDLE_TIMEOUT,
      cache: false,
      interactive: true,
    },
  },

  articleDisplayMode: 'fullscreen',
  windowStyle: 'mac',
  browserEasterEgg: true,

  footer: {
    since: 2024,
    icon: {
      name: 'i-ri-cloud-line',
      animated: true,
      color: 'var(--va-c-primary)',
      url: 'https://sponsors.yunyoujun.cn',
      title: 'Sponsor YunYouJun',
    },

    powered: true,

    beian: {
      enable: false,
      icp: '',
    },
  },

  nav: [],

  apps: {
    files: true,
    notes: true,
    album: true,
  },
}

// write a vite plugin
// https://vitejs.dev/guide/api-plugin.html
export function themePlugin(): Plugin {
  return {
    name: 'valaxy-theme-arona',

    config() {
      return {
        // Waline 在评论区挂载时才加载，提前预构建避免 dev 下整页刷新
        optimizeDeps: {
          include: [
            'recaptcha-v3',
            '@waline/client',
            '@waline/client/component',
          ],
        },
      }
    },
  }
}

/**
 * generateSafelist by config
 * @param themeConfig
 */
export function generateSafelist(themeConfig: ThemeConfig) {
  const safelist: string[] = []

  const footerIcon = themeConfig.footer?.icon?.name
  if (footerIcon)
    safelist.push(footerIcon)

  // 应用/窗口图标
  const appIcons = [
    'i-ri-file-list-3-line',
    'i-ri-file-text-line',
    'i-ri-folder-2-line',
    'i-ri-folder-open-line',
    'i-ri-sticky-note-line',
    'i-ri-gallery-line',
    'i-ri-image-line',
    'i-ri-markdown-line',
    'i-ri-external-link-line',
    'i-ri-add-line',
    'i-ri-layout-grid-line',
    'i-ri-list-check-2',
    'i-ri-archive-line',
    'i-ri-links-line',
    'i-ri-information-line',
    'i-ri-settings-3-line',
    'i-ri-sun-line',
    'i-ri-moon-line',
    'i-ri-close-line',
    'i-ri-subtract-line',
    'i-ri-checkbox-blank-line',
    'i-ri-fullscreen-line',
    'i-ri-fullscreen-exit-line',
    'i-ri-arrow-left-line',
    'i-ri-search-line',
    'i-ri-time-line',
    'i-ri-calendar-line',
    'i-ri-arrow-right-s-line',
    'i-ri-translate',
    'i-ri-chat-3-line',
    'i-ri-layout-2-line',
    'i-ri-window-line',
    'i-ri-file-search-line',
    'i-ri-loader-4-line',
    'i-ri-globe-line',
    'i-ri-apple-line',
    'i-ri-windows-line',
    'i-ri-refresh-line',
    'i-ri-lock-line',
    'i-ri-home-line',
  ]
  safelist.push(...appIcons)

  return safelist
}
