<script setup lang="ts">
import type { DesktopWindow } from '../composables/desktop'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useDesktop } from '../composables/desktop'
import { MENUBAR_HEIGHT, WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from '../shared/layout'

const props = defineProps<{
  window: DesktopWindow
  /**
   * 是否为当前激活窗口（用于焦点样式）
   */
  active?: boolean
}>()

const emit = defineEmits<{
  (e: 'focus', id: string): void
  (e: 'close', id: string): void
  (e: 'minimize', id: string): void
  (e: 'toggleMaximize', id: string): void
  (e: 'move', id: string, x: number, y: number): void
  (e: 'resize', id: string, width: number, height: number): void
}>()

const win = props.window
const desktop = useDesktop()
const isWindowsStyle = computed(() => desktop.windowStyle.value === 'windows')

// 拖拽/缩放期间禁用尺寸与位移过渡，保证窗口完全跟手
const interacting = ref(false)

/**
 * 进行中的指针交互清理函数
 *
 * 交互过程中若组件被卸载（窗口关闭动画结束被移除），必须调用它，
 * 否则挂在 window 上的 pointermove / pointerup / pointercancel 会泄漏。
 */
let activeTeardown: (() => void) | undefined

onBeforeUnmount(() => {
  activeTeardown?.()
})

/**
 * 使用 pointer capture + requestAnimationFrame 合并 pointermove
 *
 * 网页壁纸运行时主线程负载较高，pointermove 事件可能大量堆积，
 * 直接在每次事件中更新窗口位置会导致窗口滞后并在恢复后瞬移。
 */
function startPointerInteraction(
  e: PointerEvent,
  applyMove: (dx: number, dy: number) => void,
) {
  const target = e.currentTarget as HTMLElement | null
  const pointerId = e.pointerId
  const startX = e.clientX
  const startY = e.clientY
  let latestX = startX
  let latestY = startY
  let frame = 0
  let finished = false

  try {
    target?.setPointerCapture?.(pointerId)
  }
  catch {
    // 某些指针状态下可能无法捕获，忽略
  }

  const apply = () => {
    frame = 0
    applyMove(latestX - startX, latestY - startY)
  }

  const onPointerMove = (ev: PointerEvent) => {
    latestX = ev.clientX
    latestY = ev.clientY
    if (frame)
      return
    frame = requestAnimationFrame(apply)
  }

  let finish: () => void

  /** 只做清理、不提交最终位置；组件卸载时走这条路 */
  const cleanup = () => {
    if (frame) {
      cancelAnimationFrame(frame)
      frame = 0
    }

    try {
      target?.releasePointerCapture?.(pointerId)
    }
    catch {}

    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', finish)
    window.removeEventListener('pointercancel', finish)
    target?.removeEventListener('lostpointercapture', finish)
    interacting.value = false
    if (activeTeardown === cleanup)
      activeTeardown = undefined
  }

  finish = () => {
    if (finished)
      return
    finished = true

    cleanup()

    // 提交最后一帧位置，避免松手后停在旧坐标
    applyMove(latestX - startX, latestY - startY)
  }

  activeTeardown = cleanup

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', finish)
  window.addEventListener('pointercancel', finish)
  target?.addEventListener('lostpointercapture', finish, { once: true })
}

// ---------------- dragging ----------------
function onDragStart(e: PointerEvent) {
  if (win.maximized)
    return
  const target = e.target
  if (target instanceof Element && target.closest('[data-window-control]'))
    return

  emit('focus', win.id)
  interacting.value = true

  const originX = win.x
  const originY = win.y
  startPointerInteraction(e, (dx, dy) => {
    emit('move', win.id, clampX(originX + dx), clampY(originY + dy))
  })
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
  interacting.value = true

  const base = { x: win.x, y: win.y, w: win.width, h: win.height }
  startPointerInteraction(e, (dx, dy) => {
    let { x, y, w, h } = base
    if (dir.includes('e'))
      w = Math.max(WINDOW_MIN_WIDTH, base.w + dx)
    if (dir.includes('s'))
      h = Math.max(WINDOW_MIN_HEIGHT, base.h + dy)
    if (dir.includes('w')) {
      w = Math.max(WINDOW_MIN_WIDTH, base.w - dx)
      x = clampX(base.x + (base.w - w))
    }
    if (dir.includes('n')) {
      h = Math.max(WINDOW_MIN_HEIGHT, base.h - dy)
      y = clampY(base.y + (base.h - h))
    }
    emit('resize', win.id, w, h)
    if (dir.includes('w') || dir.includes('n'))
      emit('move', win.id, x, y)
  })
}

/** 距菜单栏的最小间距 */
const MIN_Y = MENUBAR_HEIGHT + 4
/** 拖动/缩放时至少保留在视口内的窗口边缘尺寸 */
const EDGE_KEEP_X = 60
const EDGE_KEEP_Y = 90

function clampX(x: number) {
  const maxX = Math.max(0, (typeof window !== 'undefined' ? window.innerWidth : 1280) - EDGE_KEEP_X)
  return Math.round(Math.min(Math.max(-(win.width - EDGE_KEEP_X), x), maxX))
}

function clampY(y: number) {
  const maxY = Math.max(MIN_Y, (typeof window !== 'undefined' ? window.innerHeight : 800) - EDGE_KEEP_Y)
  return Math.round(Math.min(Math.max(MIN_Y, y), maxY))
}
</script>

<template>
  <div
    class="mac-window"
    :class="{
      'is-maximized': win.maximized,
      'is-minimized': win.minimized,
      'is-closing': win.closing,
      'is-active': active && !win.closing,
      'is-interacting': interacting,
      'is-windows': isWindowsStyle,
    }"
    :style="{
      zIndex: win.z,
      width: `${win.width}px`,
      height: `${win.height}px`,
      transform: `translate(${win.x}px, ${win.y}px)`,
    }"
    @pointerdown="emit('focus', win.id)"
  >
    <!-- 标题栏 -->
    <div
      class="mac-window__titlebar"
      @pointerdown="onDragStart"
      @dblclick="emit('toggleMaximize', win.id)"
    >
      <div v-if="!isWindowsStyle" class="mac-window__lights">
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
          @click="emit('toggleMaximize', win.id)"
        >
          <i i-ri-checkbox-blank-line />
        </button>
      </div>
      <div v-else class="mac-window__win-controls">
        <button
          class="mac-win-btn mac-win-btn--minimize"
          title="最小化"
          data-window-control
          @click="emit('minimize', win.id)"
        >
          <i i-ri-subtract-line />
        </button>
        <button
          class="mac-win-btn mac-win-btn--maximize"
          title="最大化"
          data-window-control
          @click="emit('toggleMaximize', win.id)"
        >
          <i i-ri-checkbox-blank-line />
        </button>
        <button
          class="mac-win-btn mac-win-btn--close"
          title="关闭"
          data-window-control
          @click="emit('close', win.id)"
        >
          <i i-ri-close-line />
        </button>
      </div>

      <div class="mac-window__title">
        <span v-if="win.icon" :class="win.icon" class="mac-window__title-icon" />
        <span class="truncate">{{ win.title }}</span>
      </div>

      <!-- 移动端专用关闭按钮：窄屏下交通灯与 Windows 控件都会被隐藏 -->
      <button
        class="mac-window__mobile-close"
        title="关闭"
        data-window-control
        @click="emit('close', win.id)"
      >
        <i i-ri-close-line />
      </button>
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
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(248, 249, 252, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.12),
    0 16px 48px 2px rgba(0, 0, 0, 0.26),
    0 6px 18px rgba(0, 0, 0, 0.14);
  /* 打开时播放入场动画（仅元素挂载时执行一次） */
  animation: st-window-in 0.34s var(--st-ease-out) backwards;
  transition:
    box-shadow var(--st-dur-base) var(--st-ease-in-out),
    background var(--st-dur-base) ease,
    opacity var(--st-dur-base) var(--st-ease-in-out),
    border-radius var(--st-dur-base) var(--st-ease-out),
    top var(--st-dur-base) var(--st-ease-out),
    transform var(--st-dur-base) var(--st-ease-out),
    width var(--st-dur-base) var(--st-ease-out),
    height var(--st-dur-base) var(--st-ease-out),
    translate var(--st-dur-base) var(--st-ease-out),
    scale var(--st-dur-base) var(--st-ease-out);
}

/* 拖拽/缩放进行中：关闭尺寸与位移过渡，保证窗口完全跟手 */
.mac-window.is-interacting {
  will-change: transform;
  transition:
    box-shadow var(--st-dur-base) var(--st-ease-in-out),
    opacity var(--st-dur-base) var(--st-ease-in-out),
    border-radius var(--st-dur-base) var(--st-ease-out);
}

/* 激活窗口：玻璃更实、阴影更深，营造悬浮层级感 */
.mac-window.is-active {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.58), rgba(250, 251, 254, 0.52));
  border-color: rgba(255, 255, 255, 0.7);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.12),
    0 28px 80px 6px rgba(0, 0, 0, 0.34),
    0 10px 28px rgba(0, 0, 0, 0.2);
}

.mac-window.is-closing {
  pointer-events: none;
  animation: st-window-out var(--st-dur-base) var(--st-ease-in) forwards;
}

.mac-window.is-minimized {
  opacity: 0;
  pointer-events: none;
  scale: 0.88;
  translate: 0 42vh;
  border-radius: 26px;
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
  background: linear-gradient(to bottom, rgba(58, 58, 68, 0.5), rgba(28, 28, 34, 0.5));
  border-color: rgba(255, 255, 255, 0.09);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.5),
    0 16px 48px 2px rgba(0, 0, 0, 0.55);
}

html.dark .mac-window.is-active {
  background: linear-gradient(to bottom, rgba(68, 68, 80, 0.6), rgba(36, 36, 44, 0.54));
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.5),
    0 28px 80px 6px rgba(0, 0, 0, 0.62);
}

.mac-window__titlebar {
  display: flex;
  align-items: center;
  height: 40px;
  flex-shrink: 0;
  padding: 0 14px;
  cursor: default;
  user-select: none;
  touch-action: none;
  position: relative;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08));
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

html.dark .mac-window__titlebar {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
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

.mac-window__win-controls {
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
}

.mac-win-btn {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--va-c-text);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.mac-win-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.mac-win-btn--close:hover {
  background: #e81123;
  color: #fff;
}

html.dark .mac-win-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

html.dark .mac-win-btn--close:hover {
  background: #e81123;
  color: #fff;
}

.mac-window__title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--va-c-text);
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
  touch-action: none;
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

/* 移动端专用关闭按钮：窄屏下没有交通灯，需要一个显式的关闭入口 */
.mac-window__mobile-close {
  display: none;
  position: absolute;
  right: 8px;
  top: 50%;
  translate: 0 -50%;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.08);
  color: var(--va-c-text);
  font-size: 15px;
  cursor: pointer;
}

.mac-window__mobile-close:active {
  scale: 0.94;
}

html.dark .mac-window__mobile-close {
  background: rgba(255, 255, 255, 0.12);
  color: #f0f8ff;
}

/* 移动端：隐藏交通灯、精简标题栏 */
@media (max-width: 768px) {
  .mac-window__lights {
    display: none;
  }

  .mac-window__win-controls {
    display: none;
  }

  .mac-window__mobile-close {
    display: flex;
  }

  .mac-window__titlebar {
    height: 36px;
  }

  .mac-window__title {
    font-size: 12px;
  }
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
