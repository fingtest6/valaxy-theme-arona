import type { ThemeConfig } from '../types'
import { useConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * getThemeConfig
 *
 * 同时兼容主题配置写在 valaxy.config.ts 与 site.config.ts 两种方式，
 * 后者作为前者的补充（前者优先级更高）。
 */
export function useThemeConfig<T = ThemeConfig>() {
  const config = useConfig<T>()
  return computed(() => {
    const tc = config!.value.themeConfig || {}
    const siteTc = (config!.value.siteConfig as any)?.themeConfig || {}
    return { ...siteTc, ...tc } as T
  })
}
