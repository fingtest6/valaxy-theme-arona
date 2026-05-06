<script setup>
import { Waline } from '@waline/client/component'
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'

import '@waline/client/style'

const themeConfig = useThemeConfig()
const siteConfig = useSiteConfig()
const serverURL = themeConfig.value.walineServerURL
const route = useRoute()
const path = computed(() => route?.path || '')
// 添加评论功能开关控制
const enableComment = computed(() => {
  return siteConfig.value.comment?.enable ?? false
})
</script>

<template>
  <div v-if="enableComment && serverURL">
    <Waline :server-u-r-l="serverURL" :path="path" />
  </div>
</template>

<style>
:root {
  /* 字体大小和主题颜色 */
  --waline-font-size: 16px;
  --waline-theme-color: #0093ff;
  --waline-active-color: #00b0ff;
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
