import type { ResolvedValaxyOptions } from 'valaxy'
import type { Plugin } from 'vite'
import type { ThemeConfig } from '../types'

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

  wallpaper: {
    blur: false,
  },

  articleDisplayMode: 'fullscreen',

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
}

// write a vite plugin
// https://vitejs.dev/guide/api-plugin.html
export function themePlugin(options: ResolvedValaxyOptions<ThemeConfig>): Plugin {
  // 确保 themeConfig 始终有值，并合并默认配置
  const themeConfig: ThemeConfig = {
    ...defaultThemeConfig,
    ...options.config.themeConfig,
    colors: {
      ...defaultThemeConfig.colors,
      ...options.config.themeConfig?.colors,
    },
  }

  return {
    name: 'valaxy-theme-arona',

    config() {
      return {
        css: {
          preprocessorOptions: {
            scss: {
              // 确保 primary 始终有值
              additionalData: `$c-primary: ${themeConfig.colors?.primary || '#0078E7'} !default;`,
            },
          },
        },

        valaxy: {},
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
  ]
  safelist.push(...appIcons)

  return safelist
}
