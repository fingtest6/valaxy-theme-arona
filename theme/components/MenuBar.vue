<script setup lang="ts">
import { useAppStore, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useDesktop } from '../composables/desktop'
import { useIsMobile } from '../composables/useIsMobile'
import { useWebWallpaper } from '../composables/webWallpaper'

const desktop = useDesktop()
const isMobile = useIsMobile()
const {
  available: webWallpaperAvailable,
  enabled: webWallpaperEnabled,
  mobile: webWallpaperMobile,
  toggle: toggleWebWallpaper,
} = useWebWallpaper()
const appStore = useAppStore()
const siteConfig = useSiteConfig()

const siteTitle = computed(() => siteConfig.value?.title || 'Valaxy Theme Arona')
const favicon = computed(() => siteConfig.value?.favicon || '')
const activeTitle = computed(() => desktop.activeWindow.value?.title || '')

function openSettings() {
  desktop.openApp('settings')
}

function toggleDark(e: MouseEvent) {
  appStore.toggleDarkWithTransition(e)
}
</script>

<template>
  <header class="menubar">
    <div class="menubar__left">
      <img v-if="favicon" class="menubar__logo" :src="favicon" alt="logo">
      <span class="menubar__brand">{{ siteTitle }}</span>
      <!-- 激活窗口标题切换：key 重建触发入场动画（不使用 Transition，避免高频切换下的 DOM 竞态） -->
      <span v-if="activeTitle" :key="activeTitle" class="menubar__active menubar__active--in">
        <span class="menubar__sep">|</span>
        <span class="menubar__window">{{ activeTitle }}</span>
      </span>
    </div>

    <div class="menubar__right">
      <button
        v-if="webWallpaperAvailable && (webWallpaperMobile || !isMobile)"
        class="menubar__switch"
        :class="{ 'is-on': webWallpaperEnabled }"
        role="switch"
        :aria-checked="webWallpaperEnabled"
        :title="webWallpaperEnabled ? '关闭网页壁纸' : '开启网页壁纸'"
        @click="toggleWebWallpaper"
      >
        <span class="menubar__switch-thumb" />
      </button>
      <button
        class="menubar__btn"
        title="设置"
        :class="{ 'is-active': desktop.activeWindow.value?.app === 'settings' }"
        @click="openSettings"
      >
        <i i-ri-settings-3-line />
      </button>
      <button
        class="menubar__btn"
        :title="appStore.isDark ? '切换到亮色模式' : '切换到暗色模式'"
        @click="toggleDark"
      >
        <i v-if="!appStore.isDark" i-ri-sun-line />
        <i v-else i-ri-moon-line />
      </button>
    </div>
  </header>
</template>

<style scoped>
.menubar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--st-menubar-h, 30px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 13px;
  color: var(--va-c-text);
  background: rgba(250, 250, 252, 0.55);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  user-select: none;
  /* 开机自顶部滑入 */
  animation: st-slide-down var(--st-dur-boot) var(--st-ease-out) 0.05s backwards;
}

html.dark .menubar {
  background: rgba(24, 24, 28, 0.6);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.menubar__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-weight: 600;
}

.menubar__logo {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  object-fit: contain;
}

.menubar__brand {
  font-weight: 700;
  white-space: nowrap;
}

.menubar__sep {
  opacity: 0.4;
  font-weight: 400;
}

.menubar__active {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* 标题切换入场动画（key 重建时播放） */
.menubar__active--in {
  animation: menubar-title-in 0.2s var(--st-ease-out);
}

@keyframes menubar-title-in {
  from {
    opacity: 0;
    translate: 0 5px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

.menubar__window {
  opacity: 0.75;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40vw;
}

.menubar__right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.menubar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 24px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--va-c-text);
  cursor: pointer;
  font-size: 15px;
  transition:
    background 0.15s ease,
    scale 0.15s var(--st-ease-spring);
}

.menubar__btn:hover,
.menubar__btn.is-active {
  background: rgba(0, 0, 0, 0.08);
}

.menubar__btn:active {
  scale: 0.88;
}

html.dark .menubar__btn:hover,
html.dark .menubar__btn.is-active {
  background: rgba(255, 255, 255, 0.12);
}

.menubar__switch {
  position: relative;
  flex-shrink: 0;
  width: 34px;
  height: 18px;
  margin-right: 2px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: background 0.2s ease;
}

.menubar__switch.is-on {
  background: var(--st-accent);
}

.menubar__switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.menubar__switch.is-on .menubar__switch-thumb {
  transform: translateX(16px);
}

html.dark .menubar__switch {
  background: rgba(255, 255, 255, 0.18);
}
</style>
