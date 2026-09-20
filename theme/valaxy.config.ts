import type { ResolvedValaxyOptions, ValaxyTheme } from 'valaxy'
import type { ThemeConfig } from './types'
import { defineTheme } from 'valaxy'
import { createAppsPlugin, createWallpaperPlugin, defaultThemeConfig, generateSafelist, themePlugin, writeAppRedirects } from './node'
import { matchAppRoute } from './shared/apps'

interface AppRouteNode {
  fullPath: string
  delete: () => void
}

/**
 * Valaxy 主题类型目前没有放开 router / hooks / siteConfig，
 * 但主题在运行时可以通过合并配置提供这些默认值。
 */
interface AronaThemeConfigExtend {
  router?: {
    extendRoute?: (route: AppRouteNode) => void
  }
  hooks?: {
    'build:after'?: () => Promise<void> | void
  }
  siteConfig?: {
    fuse?: {
      pattern?: string
    }
  }
}

function createThemeConfig(options: ResolvedValaxyOptions<ThemeConfig>): ValaxyTheme<ThemeConfig> & AronaThemeConfigExtend {
  return {
    // 主题接管 App 页面，默认搜索索引只包含 posts
    siteConfig: {
      fuse: {
        pattern: 'pages/posts/**/*.md',
      },
    },
    // 移除被 App 接管的页面路由；关闭 App 时保留原页面
    router: {
      extendRoute(route) {
        if (matchAppRoute(route.fullPath, options.config.themeConfig?.apps))
          route.delete()
      },
    },
    // SSG 完成、sitemap 生成后，再生成轻量跳转页
    hooks: {
      'build:after': async () => {
        await writeAppRedirects(options)
      },
    },
    themeConfig: defaultThemeConfig,
    vite: {
      plugins: [
        themePlugin(),
        createAppsPlugin(options),
        createWallpaperPlugin(options),
      ],
    },
    unocss: {
      safelist: generateSafelist(options.config.themeConfig as ThemeConfig),
    },
  }
}

export default defineTheme<ThemeConfig>(createThemeConfig)
