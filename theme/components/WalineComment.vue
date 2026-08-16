<script setup lang="ts">
import { Waline } from '@waline/client/component'
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'

import '@waline/client/style'

const props = defineProps<{
  /**
   * 可选：显式指定评论对应的文章路径（用于多文章窗口场景）
   */
  path?: string
}>()

const themeConfig = useThemeConfig()
const siteConfig = useSiteConfig()
const route = useRoute()

const serverURL = computed(() => {
  return themeConfig.value.walineServerURL
    || (siteConfig.value as any)?.themeConfig?.walineServerURL
    || ''
})

const path = computed(() => {
  const baseUrl = siteConfig.value.url || ''
  const currentPath = props.path || route?.path || ''
  if (baseUrl && currentPath) {
    const cleanBase = baseUrl.replace(/\/$/, '')
    const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
    return `${cleanBase}${cleanPath}`
  }
  return currentPath || ''
})

const enableComment = computed(() => {
  return siteConfig.value.comment?.enable ?? false
})
</script>

<template>
  <div v-if="enableComment && serverURL" class="waline-comment">
    <Waline :server-u-r-l="serverURL" :path="path" />
  </div>
</template>

<style>
:root {
  /* 字体大小和主题颜色 */
  --waline-font-size: 16px;
  --waline-theme-color: var(--st-accent, #0078e7);
  --waline-active-color: var(--st-accent, #0078e7);
}

html.dark {
  --waline-active-color: #002332;
  --waline-info-bg-color: rgba(133, 133, 133, 0.55);
  --waline-info-color: #ffffff;
  --waline-color: #ffffff;
  --waline-bg-color: rgba(184, 9, 9, 0);
  --waline-bg-color-light: rgba(0, 0, 0, 0.05);
  --waline-border-color: rgba(0, 0, 0, 0.67);
}
</style>

<style scoped>
.waline-comment {
  padding-top: 8px;
}
</style>
