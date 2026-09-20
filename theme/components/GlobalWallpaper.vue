<script setup lang="ts">
import { useAppStore, withBase } from 'valaxy'
import { computed, onMounted } from 'vue'
import bgLight from '../assets/backgrounds/AronaRoom.webp'
import bgDark from '../assets/backgrounds/AronaRoom_Night.webp'
import { useThemeConfig, useWebWallpaper } from '../composables'
import { useIsMobile } from '../composables/useIsMobile'
import { resolveWallpaperWebOptions } from '../shared/wallpaper'
import WebWallpaper from './WebWallpaper.vue'

const appStore = useAppStore()
const themeConfig = useThemeConfig()
const isMobile = useIsMobile()
const { enabled: webWallpaperEnabled, initClientState } = useWebWallpaper()

// 客户端挂载后再读取本地开关与性能检测结果，避免 SSR 水合不一致
onMounted(initClientState)

// ---------- 静态壁纸（海报兜底） ----------
const wallpaperConfig = computed(() => themeConfig.value.wallpaper || {})
const useBuiltinWallpaper = computed(() => !wallpaperConfig.value.light && !wallpaperConfig.value.dark)
const wallpaperLight = computed(() => wallpaperConfig.value.light || (useBuiltinWallpaper.value ? bgLight : ''))
const wallpaperDark = computed(() => wallpaperConfig.value.dark || (useBuiltinWallpaper.value ? bgDark : ''))
const wallpaperBlur = computed(() => !!wallpaperConfig.value.blur)

// ---------- 网页壁纸 ----------
const wallpaperWeb = computed(() => resolveWallpaperWebOptions(wallpaperConfig.value))
const showWebWallpaper = computed(() =>
  webWallpaperEnabled.value
  && !!wallpaperWeb.value.url
  && (wallpaperWeb.value.mobile || !isMobile.value),
)
const webWallpaperUrl = computed(() => withBase(wallpaperWeb.value.url))
</script>

<template>
  <div class="global-wallpaper">
    <!-- 静态壁纸：亮/暗两层交叉淡入淡出，同时作为网页壁纸的海报兜底 -->
    <div class="global-wallpaper__poster" :class="{ 'is-blur': wallpaperBlur }">
      <div
        class="global-wallpaper__layer"
        :class="{ 'is-on': !appStore.isDark || !wallpaperDark }"
        :style="wallpaperLight ? { backgroundImage: `url(${wallpaperLight})` } : undefined"
      />
      <div
        v-if="wallpaperDark"
        class="global-wallpaper__layer"
        :class="{ 'is-on': appStore.isDark }"
        :style="{ backgroundImage: `url(${wallpaperDark})` }"
      />
    </div>

    <!-- 网页壁纸：首屏空闲后挂载，加载完成后淡入；跨路由不会重新加载 -->
    <WebWallpaper
      v-if="showWebWallpaper"
      :url="webWallpaperUrl"
      :idle-timeout="wallpaperWeb.idleTimeout"
      :cache="wallpaperWeb.cache"
      :interactive="wallpaperWeb.interactive"
    />
  </div>
</template>

<style scoped>
.global-wallpaper {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.global-wallpaper__poster {
  position: absolute;
  inset: 0;
  animation: st-settle 0.9s var(--st-ease-out) backwards;
  transition:
    filter 0.5s var(--st-ease-in-out),
    transform 0.5s var(--st-ease-in-out);
}

.global-wallpaper__poster.is-blur {
  filter: blur(14px) brightness(0.9);
  transform: scale(1.06);
}

.global-wallpaper__layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.global-wallpaper__layer.is-on {
  opacity: 1;
}
</style>
