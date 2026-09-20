<script setup lang="ts">
import { useAppStore, useLocale, useSiteConfig } from 'valaxy'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeConfig, useWebWallpaper } from '../../composables'
import { useDesktop } from '../../composables/desktop'
import { useIsMobile } from '../../composables/useIsMobile'
import { STORAGE_KEYS, writeStorage } from '../../shared/storage'

const appStore = useAppStore()
const desktop = useDesktop()
const themeConfig = useThemeConfig()
const siteConfig = useSiteConfig()
const { toggleLocales } = useLocale()
const { locale } = useI18n()

const isMobile = useIsMobile()

const {
  available: webWallpaperAvailable,
  enabled: webWallpaperEnabled,
  mobile: webWallpaperMobile,
  toggle: toggleWebWallpaper,
} = useWebWallpaper()

const ACCENTS = [
  { name: '蓝色', value: '#0078E7' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '粉色', value: '#ec4899' },
  { name: '红色', value: '#ef4444' },
  { name: '绿色', value: '#10b981' },
  { name: '橙色', value: '#f59e0b' },
]

const showLocale = siteConfig.value.languages.length > 1

const footerClickCount = ref(0)
const BROWSER_UNLOCK_CLICKS = 5

function setAccent(color: string) {
  desktop.setAccent(color)
}

function setMode(mode: 'fullscreen' | 'window') {
  desktop.setDisplayMode(mode)
  writeStorage(STORAGE_KEYS.articleMode, mode)
}

function setWindowStyle(style: 'mac' | 'windows') {
  desktop.setWindowStyle(style)
  writeStorage(STORAGE_KEYS.windowStyle, style)
}

function onFooterClick() {
  if (themeConfig.value.browserEasterEgg === false)
    return
  footerClickCount.value += 1
  if (footerClickCount.value >= BROWSER_UNLOCK_CLICKS && !desktop.browserUnlocked.value)
    desktop.setBrowserUnlocked(true)
}

function toggleDark(e: MouseEvent) {
  appStore.toggleDarkWithTransition(e)
}
</script>

<template>
  <div class="settings-app">
    <div class="settings-app__group">
      <h3 class="settings-app__heading">
        外观
      </h3>

      <div class="setting-row">
        <div class="setting-row__label">
          <span class="setting-row__title">暗色模式</span>
          <span class="setting-row__hint">{{ appStore.isDark ? '已开启' : '已关闭' }}</span>
        </div>
        <button
          class="switch"
          :class="{ 'is-on': appStore.isDark }"
          role="switch"
          :aria-checked="appStore.isDark"
          @click="toggleDark"
        >
          <span class="switch__thumb" />
        </button>
      </div>

      <div class="setting-row">
        <div class="setting-row__label">
          <span class="setting-row__title">强调色</span>
          <span class="setting-row__hint">用于链接与高亮</span>
        </div>
      </div>
      <div class="accent-row">
        <button
          v-for="c in ACCENTS"
          :key="c.value"
          class="accent-dot"
          :title="c.name"
          :style="{ background: c.value }"
          :class="{ 'is-active': desktop.accent.value === c.value }"
          @click="setAccent(c.value)"
        />
      </div>
    </div>

    <div
      v-if="webWallpaperAvailable && (webWallpaperMobile || !isMobile)"
      class="settings-app__group"
    >
      <h3 class="settings-app__heading">
        网页壁纸
      </h3>

      <div class="setting-row">
        <div class="setting-row__label">
          <span class="setting-row__title">桌面网页壁纸</span>
          <span class="setting-row__hint">{{ webWallpaperEnabled ? '已开启' : '已关闭' }}</span>
        </div>
        <button
          class="switch"
          :class="{ 'is-on': webWallpaperEnabled }"
          role="switch"
          :aria-checked="webWallpaperEnabled"
          @click="toggleWebWallpaper"
        >
          <span class="switch__thumb" />
        </button>
      </div>
    </div>

    <div class="settings-app__group">
      <h3 class="settings-app__heading">
        窗口
      </h3>

      <div class="setting-row">
        <div class="setting-row__label">
          <span class="setting-row__title">窗口样式</span>
          <span class="setting-row__hint">标题栏按钮风格</span>
        </div>
      </div>
      <div class="mode-row">
        <button
          class="mode-btn"
          :class="{ 'is-active': desktop.windowStyle.value === 'mac' }"
          @click="setWindowStyle('mac')"
        >
          <i i-ri-apple-line />
          macOS
        </button>
        <button
          class="mode-btn"
          :class="{ 'is-active': desktop.windowStyle.value === 'windows' }"
          @click="setWindowStyle('windows')"
        >
          <i i-ri-windows-line />
          Windows
        </button>
      </div>
    </div>

    <div v-if="!isMobile" class="settings-app__group">
      <h3 class="settings-app__heading">
        文章
      </h3>

      <div class="setting-row">
        <div class="setting-row__label">
          <span class="setting-row__title">显示模式</span>
          <span class="setting-row__hint">{{ desktop.displayMode.value === 'fullscreen' ? '全屏三栏阅读' : '窗口模式' }}</span>
        </div>
      </div>
      <div class="mode-row">
        <button
          class="mode-btn"
          :class="{ 'is-active': desktop.displayMode.value === 'fullscreen' }"
          @click="setMode('fullscreen')"
        >
          <i i-ri-layout-2-line />
          全屏模式
        </button>
        <button
          class="mode-btn"
          :class="{ 'is-active': desktop.displayMode.value === 'window' }"
          @click="setMode('window')"
        >
          <i i-ri-window-line />
          窗口模式
        </button>
      </div>
    </div>

    <div v-if="showLocale" class="settings-app__group">
      <h3 class="settings-app__heading">
        语言
      </h3>
      <div class="setting-row">
        <div class="setting-row__label">
          <span class="setting-row__title">切换语言</span>
          <span class="setting-row__hint">当前：{{ locale }}</span>
        </div>
        <button class="settings-app__btn" @click="toggleLocales">
          <i i-ri-translate />
          切换
        </button>
      </div>
    </div>

    <div class="settings-app__footer">
      <p class="settings-app__easter" @click="onFooterClick">
        {{ desktop.browserUnlocked.value ? '🎉 彩蛋已解锁' : 'valaxy-theme-arona' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.settings-app {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--st-app-bg);
}

html.dark .settings-app {
  background: var(--st-app-bg-dark);
}

.settings-app__group {
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

html.dark .settings-app__group {
  background: rgba(255, 255, 255, 0.06);
}

.settings-app__heading {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(0, 0, 0, 0.5);
}

html.dark .settings-app__heading {
  color: rgba(255, 255, 255, 0.5);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
}

.setting-row__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-row__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-c-text);
}

.setting-row__hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

html.dark .setting-row__hint {
  color: rgba(255, 255, 255, 0.45);
}

.switch {
  position: relative;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  border: none;
  background: rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.switch.is-on {
  background: var(--st-accent);
}

.switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.switch.is-on .switch__thumb {
  transform: translateX(18px);
}

.accent-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px 0;
}

.accent-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

.accent-dot:hover {
  transform: scale(1.12);
}

.accent-dot.is-active {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
}

.mode-row {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.03);
  color: var(--va-c-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.mode-btn i {
  font-size: 16px;
}

.mode-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.mode-btn.is-active {
  background: var(--st-accent);
  border-color: transparent;
  color: #fff;
}

html.dark .mode-btn {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

html.dark .mode-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.settings-app__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.08);
  color: var(--va-c-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

html.dark .settings-app__btn {
  background: rgba(255, 255, 255, 0.12);
}

.settings-app__footer {
  margin-top: auto;
  padding: 12px 8px 4px;
  text-align: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}

.settings-app__easter {
  cursor: pointer;
  user-select: none;
  transition: opacity 0.15s ease;
}

.settings-app__easter:hover {
  opacity: 0.7;
}

html.dark .settings-app__footer {
  color: rgba(255, 255, 255, 0.4);
}
</style>
