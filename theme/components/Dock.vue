<script setup lang="ts">
import { computed } from 'vue'
import { APPS, useDesktop } from '../composables/desktop'

const desktop = useDesktop()

const APP_COLORS: Record<string, string> = {
  articles: 'linear-gradient(135deg, #2f80ed, #56ccf2)',
  archive: 'linear-gradient(135deg, #f2994a, #f2c94c)',
  friends: 'linear-gradient(135deg, #9b51e0, #bb6bd9)',
  about: 'linear-gradient(135deg, #27ae60, #6fcf97)',
}

// 有窗口处于最大化/全屏状态时，Dock 自动向下隐藏
const autoHide = computed(() =>
  desktop.windows.value.some(w => !w.minimized && w.maximized),
)

function onClick(appId: string) {
  // 文章应用：全屏模式打开阅读器，窗口模式打开列表
  const isReaderTarget = appId === 'articles' && desktop.displayMode.value === 'fullscreen'
  const targetApp = isReaderTarget ? 'reader' : appId

  const existing = desktop.windows.value.find(w => w.app === targetApp)
  if (!existing) {
    if (isReaderTarget)
      desktop.openReader()
    else
      desktop.openApp(appId as any)
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
  <div class="dock" :class="{ 'is-auto-hide': autoHide }">
    <div class="dock__inner">
      <button
        v-for="app in APPS"
        :key="app.id"
        class="dock__item"
        :title="app.title"
        @click="onClick(app.id)"
      >
        <div
          class="dock__icon"
          :style="{ background: APP_COLORS[app.id] }"
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
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  backdrop-filter: blur(26px) saturate(180%);
  -webkit-backdrop-filter: blur(26px) saturate(180%);
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
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
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
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom center;
}

.dock__item:hover .dock__icon {
  transform: scale(1.22) translateY(-6px);
}

.dock__tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(20, 20, 24, 0.9);
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dock__item:hover .dock__tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.dock__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: transparent;
}

.dock__dot.is-active {
  background: rgba(80, 80, 90, 0.8);
}

html.dark .dock__dot.is-active {
  background: rgba(230, 230, 240, 0.9);
}
</style>
