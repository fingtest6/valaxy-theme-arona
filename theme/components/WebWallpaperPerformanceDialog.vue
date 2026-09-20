<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useWebWallpaper } from '../composables'

const { dialogVisible, dontRemind, dismissDialog, enableAnyway } = useWebWallpaper()

const cardRef = ref<HTMLElement>()
const primaryRef = ref<HTMLButtonElement>()
let restoreFocus: HTMLElement | null = null

// aria-modal 语义要求：打开时移入焦点，关闭时归还
watch(dialogVisible, async (visible) => {
  if (visible) {
    restoreFocus = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null
    await nextTick()
    primaryRef.value?.focus()
  }
  else {
    restoreFocus?.focus?.()
    restoreFocus = null
  }
})

function focusables(): HTMLElement[] {
  const nodes = cardRef.value?.querySelectorAll<HTMLElement>('button, input, select, textarea, [href]')
  return nodes ? Array.from(nodes) : []
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    dismissDialog()
    return
  }
  if (e.key !== 'Tab')
    return

  // 简易焦点陷阱：把 Tab 循环限制在卡片内
  const list = focusables()
  if (list.length === 0)
    return

  const first = list[0]
  const last = list[list.length - 1]
  const active = typeof document !== 'undefined' ? document.activeElement : null

  if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  }
  else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <Transition name="perf-dialog">
    <div
      v-if="dialogVisible"
      class="perf-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="网页壁纸性能提示"
      @keydown="onKeydown"
    >
      <div ref="cardRef" class="perf-dialog__card">
        <h3 class="perf-dialog__title">
          网页壁纸已关闭
        </h3>
        <p class="perf-dialog__text">
          检测到开启网页壁纸后画面较卡，已自动为你关闭。
        </p>
        <p class="perf-dialog__text">
          你仍可以通过右上角开关或设置应用重新开启。
        </p>

        <label class="perf-dialog__check">
          <input v-model="dontRemind" type="checkbox">
          <span>不再弹出此提示</span>
        </label>

        <div class="perf-dialog__actions">
          <button class="perf-dialog__btn" @click="enableAnyway">
            仍然开启
          </button>
          <button ref="primaryRef" class="perf-dialog__btn perf-dialog__btn--primary" @click="dismissDialog">
            知道了
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.perf-dialog {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.22);
}

.perf-dialog__card {
  width: min(360px, 100%);
  padding: 22px 22px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.88), rgba(248, 249, 252, 0.78));
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
  color: var(--va-c-text);
}

.perf-dialog__title {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 800;
}

.perf-dialog__text {
  margin: 0 0 6px;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.62);
}

.perf-dialog__check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 18px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  user-select: none;
}

.perf-dialog__check input {
  width: 14px;
  height: 14px;
  accent-color: var(--st-accent);
}

.perf-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.perf-dialog__btn {
  padding: 8px 14px;
  border: none;
  border-radius: 9px;
  background: rgba(0, 0, 0, 0.08);
  color: var(--va-c-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    scale 0.15s ease;
}

.perf-dialog__btn:hover {
  background: rgba(0, 0, 0, 0.12);
}

.perf-dialog__btn:active {
  scale: 0.97;
}

.perf-dialog__btn--primary {
  background: var(--st-accent);
  color: #fff;
}

.perf-dialog__btn--primary:hover {
  background: color-mix(in srgb, var(--st-accent) 86%, #000);
}

html.dark .perf-dialog {
  background: rgba(0, 0, 0, 0.38);
}

html.dark .perf-dialog__card {
  border-color: rgba(255, 255, 255, 0.12);
  background: linear-gradient(to bottom, rgba(40, 40, 48, 0.94), rgba(24, 24, 30, 0.9));
  color: #f0f8ff;
}

html.dark .perf-dialog__text,
html.dark .perf-dialog__check {
  color: rgba(255, 255, 255, 0.62);
}

html.dark .perf-dialog__btn {
  background: rgba(255, 255, 255, 0.12);
  color: #f0f8ff;
}

html.dark .perf-dialog__btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.perf-dialog-enter-active,
.perf-dialog-leave-active {
  transition: opacity 0.22s ease;
}

.perf-dialog-enter-from,
.perf-dialog-leave-to {
  opacity: 0;
}
</style>
