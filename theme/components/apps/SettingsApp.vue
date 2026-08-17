<script setup lang="ts">
import { useAppStore, useLocale, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDesktop } from '../../composables/desktop'

const appStore = useAppStore()
const desktop = useDesktop()
const siteConfig = useSiteConfig()
const { toggleLocales } = useLocale()
const { locale } = useI18n()

const isMobile = computed(() => appStore.isMobile)

const ACCENTS = [
  { name: '蓝色', value: '#0078E7' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '粉色', value: '#ec4899' },
  { name: '红色', value: '#ef4444' },
  { name: '绿色', value: '#10b981' },
  { name: '橙色', value: '#f59e0b' },
]

const showLocale = siteConfig.value.languages.length > 1

function setAccent(color: string) {
  desktop.setAccent(color)
}

function setMode(mode: 'fullscreen' | 'window') {
  desktop.setDisplayMode(mode)
  if (typeof localStorage !== 'undefined')
    localStorage.setItem('arona-article-mode', mode)
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
      <p>valaxy-theme-arona</p>
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
  background: rgba(255, 255, 255, 0.55);
}

html.dark .settings-app {
  background: rgba(24, 24, 28, 0.4);
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
  color: var(--va-c-text, #333);
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
  background: var(--st-accent, #0078e7);
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
  color: var(--va-c-text, #333);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-btn i {
  font-size: 16px;
}

.mode-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.mode-btn.is-active {
  background: var(--st-accent, #0078e7);
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
  color: var(--va-c-text, #333);
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

html.dark .settings-app__footer {
  color: rgba(255, 255, 255, 0.4);
}
</style>
