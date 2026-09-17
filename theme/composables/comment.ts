import type { ComputedRef } from 'vue'
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useThemeConfig } from './config'

/**
 * 获取 Waline 服务端地址（优先 themeConfig.walineServerURL）
 */
export function useWalineServerURL(): ComputedRef<string> {
  const themeConfig = useThemeConfig()
  const siteConfig = useSiteConfig()

  return computed(() => {
    return themeConfig.value.walineServerURL
      || (siteConfig.value as any)?.themeConfig?.walineServerURL
      || ''
  })
}

/**
 * 评论是否启用
 *
 * 同时满足：
 * - siteConfig.comment.enable 为 true
 * - 已配置 Waline 服务端地址
 */
export function useCommentEnabled(): ComputedRef<boolean> {
  const siteConfig = useSiteConfig()
  const serverURL = useWalineServerURL()

  return computed(() => {
    return (siteConfig.value.comment?.enable ?? false) && !!serverURL.value
  })
}
