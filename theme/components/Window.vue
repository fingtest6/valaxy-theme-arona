<script setup lang="ts">
import type { DesktopWindow } from '../composables/desktop'

const props = defineProps<{
  window: DesktopWindow
}>()

const emit = defineEmits<{
  (e: 'focus', id: string): void
  (e: 'close', id: string): void
  (e: 'minimize', id: string): void
  (e: 'toggle-maximize', id: string): void
  (e: 'move', id: string, x: number, y: number): void
  (e: 'resize', id: string, width: number, height: number): void
}>()

const win = props.window

// ---------------- dragging ----------------
function onDragStart(e: PointerEvent) {
  if (win.maximized)
    return
  const target = e.target as HTMLElement
  if (target.closest('[data-window-control]'))
    return

  emit('focus', win.id)

  const startX = e.clientX
  const startY = e.clientY
  const originX = win.x
  const originY = win.y

  const onMove = (ev: PointerEvent) => {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    emit('move', win.id, clampX(originX + dx), clampY(originY + dy))
  }
  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

// ---------------- resizing ----------------
type Dir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

function onResizeStart(e: PointerEvent) {
  const dir = (e.currentTarget as HTMLElement)?.dataset.dir as Dir
  if (!dir || win.maximized)
    return
  e.preventDefault()
  e.stopPropagation()
  emit('focus', win.id)

  const startX = e.clientX
  const startY = e.clientY
  const o = { x: win.x, y: win.y, w: win.width, h: win.height }

  const onMove = (ev: PointerEvent) => {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY

    let { x, y, w, h } = o
    if (dir.includes('e'))
      w = Math.max(360, o.w + dx)
    if (dir.includes('s'))
      h = Math.max(280, o.h + dy)
    if (dir.includes('w')) {
      w = Math.max(360, o.w - dx)
      x = clampX(o.x + (o.w - w))
    }
    if (dir.includes('n')) {
      h = Math.max(280, o.h - dy)
      y = clampY(o.y + (o.h - h))
    }
    emit('resize', win.id, w, h)
    if (dir.includes('w') || dir.includes('n'))
      emit('move', win.id, x, y)
  }
  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

const MENU_H = 30
const MIN_Y = MENU_H + 4

function clampX(x: number) {
  const maxX = Math.max(0, (typeof window !== 'undefined' ? window.innerWidth : 1280) - 60)
  return Math.round(Math.min(Math.max(-(win.width - 60), x), maxX))
}

function clampY(y: number) {
  const maxY = Math.max(MIN_Y, (typeof window !== 'undefined' ? window.innerHeight : 800) - 90)
  return Math.round(Math.min(Math.max(MIN_Y, y), maxY))
}
</script>

<template>
  <div
    class="mac-window"
    :class="{ 'is-maximized': win.maximized, 'is-minimized': win.minimized }"
    :style="{
      zIndex: win.z,
      width: `${win.width}px`,
      height: `${win.height}px`,
      transform: `translate(${win.x}px, ${win.y}px)`,
      '--accent': 'var(--st-accent)',
    }"
    @pointerdown="emit('focus', win.id)"
  >
    <!-- 标题栏 -->
    <div
      class="mac-window__titlebar"
      @pointerdown="onDragStart"
      @dblclick="emit('toggle-maximize', win.id)"
    >
      <div class="mac-window__lights">
        <button
          class="mac-light mac-light--close"
          title="关闭"
          data-window-control
          @click="emit('close', win.id)"
        >
          <i i-ri-close-line />
        </button>
        <button
          class="mac-light mac-light--minimize"
          title="最小化"
          data-window-control
          @click="emit('minimize', win.id)"
        >
          <i i-ri-subtract-line />
        </button>
        <button
          class="mac-light mac-light--maximize"
          title="缩放"
          data-window-control
          @click="emit('toggle-maximize', win.id)"
        >
          <i i-ri-checkbox-blank-line />
        </button>
      </div>

      <div class="mac-window__title">
        <span v-if="win.icon" :class="win.icon" class="mac-window__title-icon" />
        <span class="truncate">{{ win.title }}</span>
      </div>
    </div>

    <!-- 内容 -->
    <div class="mac-window__body">
      <slot />
    </div>

    <!-- 调整大小手柄 -->
    <template v-if="!win.maximized">
      <div class="rz rz-n" data-dir="n" @pointerdown="onResizeStart" />
      <div class="rz rz-s" data-dir="s" @pointerdown="onResizeStart" />
      <div class="rz rz-e" data-dir="e" @pointerdown="onResizeStart" />
      <div class="rz rz-w" data-dir="w" @pointerdown="onResizeStart" />
      <div class="rz rz-ne" data-dir="ne" @pointerdown="onResizeStart" />
      <div class="rz rz-nw" data-dir="nw" @pointerdown="onResizeStart" />
      <div class="rz rz-se" data-dir="se" @pointerdown="onResizeStart" />
      <div class="rz rz-sw" data-dir="sw" @pointerdown="onResizeStart" />
    </template>
  </div>
</template>

<style scoped>
.mac-window {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(250, 250, 252, 0.82);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.12),
    0 22px 70px 4px rgba(0, 0, 0, 0.32),
    0 8px 24px rgba(0, 0, 0, 0.18);
  transition:
    box-shadow 0.25s ease,
    opacity 0.25s ease,
    border-radius 0.2s ease;
  will-change: transform, width, height;
}

.mac-window:not(.is-minimized):not(.is-maximized) {
  animation: window-in 0.22s ease;
}

@keyframes window-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mac-window.is-minimized {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.8) translateY(40vh);
}

.mac-window.is-maximized {
  left: 0;
  top: var(--st-menubar-h, 30px);
  width: 100% !important;
  height: calc(100vh - var(--st-menubar-h, 30px)) !important;
  transform: none !important;
  border-radius: 10px;
}

html.dark .mac-window {
  background: rgba(30, 30, 34, 0.82);
  border-color: rgba(255, 255, 255, 0.09);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.5),
    0 22px 70px 4px rgba(0, 0, 0, 0.6);
}

.mac-window__titlebar {
  display: flex;
  align-items: center;
  height: 40px;
  flex-shrink: 0;
  padding: 0 14px;
  cursor: default;
  user-select: none;
  position: relative;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.34),
    rgba(255, 255, 255, 0.12)
  );
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

html.dark .mac-window__titlebar {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.02)
  );
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.mac-window__lights {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
}

.mac-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  cursor: pointer;
  color: transparent;
  transition: filter 0.15s ease;
}

.mac-light i {
  font-size: 9px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.mac-window__lights:hover i {
  opacity: 0.85;
}

.mac-light--close {
  background: #ff5f57;
  color: rgba(90, 0, 0, 0.7);
}
.mac-light--minimize {
  background: #febc2e;
  color: rgba(90, 60, 0, 0.7);
}
.mac-light--maximize {
  background: #28c840;
  color: rgba(0, 70, 0, 0.7);
}

.mac-window__title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--va-c-text, #333);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.mac-window__title-icon {
  font-size: 14px;
  opacity: 0.7;
}

.mac-window__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
/* 调整大小手柄 */
.rz {
  position: absolute;
  z-index: 20;
}
.rz-n,
.rz-s {
  left: 8px;
  right: 8px;
  height: 5px;
  cursor: ns-resize;
}
.rz-n {
  top: 0;
}
.rz-s {
  bottom: 0;
}
.rz-e,
.rz-w {
  top: 8px;
  bottom: 8px;
  width: 5px;
}
.rz-e {
  right: 0;
  cursor: ew-resize;
}
.rz-w {
  left: 0;
  cursor: ew-resize;
}
.rz-ne,
.rz-nw,
.rz-se,
.rz-sw {
  width: 14px;
  height: 14px;
}
.rz-ne {
  top: 0;
  right: 0;
  cursor: nesw-resize;
}
.rz-nw {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}
.rz-se {
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
}
.rz-sw {
  bottom: 0;
  left: 0;
  cursor: nesw-resize;
}
</style>

<style>
/* 窗口内容的 flex 高度链：让直接子元素填满并允许内部滚动 */
.mac-window__body > * {
  flex: 1 1 0%;
  min-height: 0;
  min-width: 0;
}
</style>
