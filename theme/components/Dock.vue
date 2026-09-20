<script setup lang="ts">
import type { AppId } from '../composables/desktop'
import { computed, ref } from 'vue'
import { useThemeConfig } from '../composables'
import { APPS, useDesktop } from '../composables/desktop'
import { useIsMobile } from '../composables/useIsMobile'
import { isAppEnabled } from '../shared/apps'

const desktop = useDesktop()
const isMobile = useIsMobile()
const themeConfig = useThemeConfig()

// 有窗口处于最大化/全屏状态时，Dock 自动向下隐藏
const autoHide = computed(() =>
  desktop.windows.value.some(w => !w.minimized && w.maximized),
)

const dockApps = computed(() => {
  const apps = APPS.filter(app => isAppEnabled(app.id, themeConfig.value.apps))
  const showBrowser = themeConfig.value.browserEasterEgg !== false && desktop.browserUnlocked.value
  return showBrowser ? apps : apps.filter(app => app.id !== 'browser')
})

// ---------- Dock 波纹放大 ----------
// 悬停时按与鼠标的横向距离对图标做平滑衰减放大，模拟 macOS Dock 的呼吸感
const MAG_AMPLITUDE = 0.35
const MAG_RADIUS = 130

const iconRefs = ref<HTMLElement[]>([])
const scales = ref<number[]>([])
// 进入 Dock 时缓存图标横向中心（缩放不改变横向中心），mousemove 期间不再读布局
let iconCenters: number[] = []

function measureCenters() {
  // 按当前应用数量生成，避免 v-for 缩短后残留旧索引
  iconCenters = dockApps.value.map((_, i) => {
    const el = iconRefs.value[i]
    if (!el)
      return Number.POSITIVE_INFINITY
    const rect = el.getBoundingClientRect()
    return rect.left + rect.width / 2
  })
}

function onDockEnter() {
  measureCenters()
}

function onDockMove(e: MouseEvent) {
  if (isMobile.value)
    return
  // 图标数量变化（如解锁彩蛋）时重新测量
  if (iconCenters.length !== dockApps.value.length)
    measureCenters()
  scales.value = iconCenters.map((center) => {
    const distance = Math.abs(e.clientX - center)
    const falloff = Math.max(0, 1 - distance / MAG_RADIUS)
    return 1 + MAG_AMPLITUDE * falloff * falloff
  })
}

function onDockLeave() {
  scales.value = []
  iconCenters = []
}

function iconStyle(index: number) {
  const scale = scales.value[index]
  return scale ? { scale: scale.toFixed(3) } : undefined
}

function onClick(appId: AppId) {
  // 文章应用：全屏模式（或移动端）打开阅读器，窗口模式打开列表
  const isReaderTarget = appId === 'articles' && (isMobile.value || desktop.displayMode.value === 'fullscreen')
  const targetApp = isReaderTarget ? 'reader' : appId

  const existing = desktop.windows.value.find(w => w.app === targetApp)
  if (!existing) {
    if (isReaderTarget)
      desktop.openReader()
    else
      desktop.openApp(appId)
    return
  }
  if (existing.minimized) {
    desktop.focus(existing.id)
    return
  }
  if (desktop.activeId.value === existing.id)
    desktop.minimizeWindow(existing.id)
  else
    desktop.focus(existing.id)
}
</script>

<template>
  <div class="dock" :class="{ 'is-auto-hide': autoHide, 'is-mobile': isMobile }">
    <div
      class="dock__inner"
      @mouseenter="onDockEnter"
      @mousemove="onDockMove"
      @mouseleave="onDockLeave"
    >
      <button
        v-for="(app, i) in dockApps"
        :key="app.id"
        :ref="el => (iconRefs[i] = el as HTMLElement)"
        class="dock__item"
        :title="app.title"
        @click="onClick(app.id)"
      >
        <div
          class="dock__icon"
          :style="{ background: app.color, ...iconStyle(i) }"
        >
          <i :class="app.icon" />
        </div>
        <span class="dock__tooltip">{{ app.title }}</span>
        <span class="dock__dot" :class="{ 'is-active': desktop.windows.value.some(w => w.app === app.id && !w.minimized) }" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.dock {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  height: var(--st-dock-h, 84px);
  display: flex;
  align-items: flex-end;
  /* 开机自底部滑入（translate 独立属性，与自动隐藏用的 transform 互不干扰） */
  animation: st-slide-up var(--st-dur-boot) var(--st-ease-out) 0.12s backwards;
  transition: transform 0.35s var(--st-ease-in-out);
}

.dock.is-auto-hide {
  transform: translate(-50%, calc(100% - 14px));
}

.dock.is-auto-hide:hover {
  transform: translate(-50%, 0);
}

.dock__inner {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 22px;
  background: rgba(250, 250, 252, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.24);
}

html.dark .dock__inner {
  background: rgba(30, 30, 34, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
}

.dock__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: translate 0.15s var(--st-ease-out);
}

/* 按压反馈：整个图标微微下沉 */
.dock__item:active {
  translate: 0 3px;
}

.dock__icon {
  width: 54px;
  height: 54px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 4px 10px rgba(0, 0, 0, 0.22);
  transform-origin: bottom center;
  /* scale 由鼠标位置驱动，短过渡让放大产生柔滑的拖尾感 */
  transition: scale 0.18s ease-out;
}

.dock__tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(4px) scale(0.9);
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(20, 20, 24, 0.9);
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.18s ease,
    transform 0.18s var(--st-ease-spring);
}

.dock__item:hover .dock__tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

.dock__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(80, 80, 90, 0);
  scale: 0;
  transition:
    scale 0.25s var(--st-ease-spring),
    background-color 0.2s ease;
}

.dock__dot.is-active {
  background: rgba(80, 80, 90, 0.8);
  scale: 1;
}

html.dark .dock__dot.is-active {
  background: rgba(230, 230, 240, 0.9);
}

/* 移动端 Dock 缩小 */
.dock.is-mobile {
  height: 66px;
}

.dock.is-mobile .dock__inner {
  gap: 8px;
  padding: 6px 8px;
  max-width: calc(100vw - 12px);
  overflow-x: auto;
  scrollbar-width: none;
}

.dock.is-mobile .dock__inner::-webkit-scrollbar {
  display: none;
}

.dock.is-mobile .dock__icon {
  width: 46px;
  height: 46px;
  border-radius: 11px;
  font-size: 24px;
}
</style>
