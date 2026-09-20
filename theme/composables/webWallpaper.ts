import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import { readStorage, STORAGE_KEYS, writeStorage } from '../shared/storage'
import { wait } from '../shared/wait'
import { resolveWallpaperWebOptions } from '../shared/wallpaper'
import { useThemeConfig } from './config'

const PERF_SAMPLE_DELAY = 2000
const PERF_SAMPLE_DURATION = 2500
const PERF_MIN_FPS = 30
const PERF_MAX_JANK_RATIO = 0.4

let resolvedConfig: ReturnType<typeof resolveWallpaperWebOptions> | null = null
let manualPreference: 'on' | 'off' | null = null
let clientStateApplied = false
let detectionStarted = false
let detectionCancelled = false

const enabled = ref(false)
const dialogVisible = ref(false)
const dontRemind = ref(false)

function waitForVisible() {
  if (typeof document === 'undefined' || document.visibilityState === 'visible')
    return Promise.resolve()

  return new Promise<void>((resolve) => {
    const onChange = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', onChange)
        resolve()
      }
    }
    document.addEventListener('visibilitychange', onChange)
  })
}

/**
 * 采样一段时间内的帧率与长帧比例
 * @returns 是否判定为卡顿
 */
async function measurePerformance(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof performance === 'undefined')
    return false

  await waitForVisible()

  return new Promise<boolean>((resolve) => {
    const start = performance.now()
    let last = start
    let frames = 0
    let longFrames = 0

    function tick(now: number) {
      const delta = now - last
      last = now
      if (delta > 0) {
        frames += 1
        if (delta > 50)
          longFrames += 1
      }

      const elapsed = now - start
      if (elapsed < PERF_SAMPLE_DURATION) {
        requestAnimationFrame(tick)
        return
      }

      const seconds = Math.max(elapsed / 1000, 0.001)
      const fps = frames / seconds
      const jankRatio = frames > 0 ? longFrames / frames : 1
      resolve(fps < PERF_MIN_FPS || jankRatio > PERF_MAX_JANK_RATIO)
    }

    requestAnimationFrame(tick)
  })
}

async function runPerformanceDetection() {
  await wait(PERF_SAMPLE_DELAY)

  if (detectionCancelled || manualPreference || !enabled.value)
    return

  const slow = await measurePerformance()

  if (detectionCancelled || manualPreference)
    return

  writeStorage(STORAGE_KEYS.webWallpaperPerf, slow ? 'slow' : 'ok')

  if (!slow)
    return

  enabled.value = false

  if (readStorage(STORAGE_KEYS.webWallpaperNoTip) !== '1') {
    dontRemind.value = false
    dialogVisible.value = true
  }
}

export interface UseWebWallpaperReturn {
  available: ComputedRef<boolean>
  mobile: ComputedRef<boolean>
  enabled: Ref<boolean>
  dialogVisible: Ref<boolean>
  dontRemind: Ref<boolean>
  toggle: () => void
  setEnabled: (value: boolean, fromUser?: boolean) => void
  enableAnyway: () => void
  dismissDialog: () => void
  initClientState: () => void
  markLoaded: () => void
}

export function useWebWallpaper(): UseWebWallpaperReturn {
  const themeConfig = useThemeConfig()

  if (!resolvedConfig) {
    const web = resolveWallpaperWebOptions(themeConfig.value.wallpaper)
    resolvedConfig = web
    enabled.value = web.enable && !!web.url
  }

  const available = computed(() => !!resolvedConfig?.enable && !!resolvedConfig?.url)
  const mobile = computed(() => !!resolvedConfig?.mobile)

  function setEnabled(value: boolean, fromUser = true) {
    if (!available.value) {
      enabled.value = false
      return
    }

    if (fromUser) {
      manualPreference = value ? 'on' : 'off'
      detectionCancelled = true
      writeStorage(STORAGE_KEYS.webWallpaper, manualPreference)
    }

    enabled.value = value
    if (!value)
      dialogVisible.value = false
  }

  function toggle() {
    setEnabled(!enabled.value)
  }

  /** 记住「不再弹出此提示」；两个出口都要落盘，否则勾选会被静默丢弃 */
  function persistDontRemind() {
    if (dontRemind.value)
      writeStorage(STORAGE_KEYS.webWallpaperNoTip, '1')
  }

  function enableAnyway() {
    setEnabled(true)
    persistDontRemind()
    dialogVisible.value = false
  }

  function dismissDialog() {
    dialogVisible.value = false
    persistDontRemind()
  }

  function initClientState() {
    if (clientStateApplied || typeof window === 'undefined' || !resolvedConfig)
      return

    clientStateApplied = true

    if (!available.value) {
      enabled.value = false
      return
    }

    const manual = readStorage(STORAGE_KEYS.webWallpaper)
    if (manual === 'on' || manual === 'off') {
      manualPreference = manual
      enabled.value = manual === 'on'
      return
    }

    const perf = readStorage(STORAGE_KEYS.webWallpaperPerf)
    if (perf === 'slow') {
      enabled.value = false
      if (readStorage(STORAGE_KEYS.webWallpaperNoTip) !== '1') {
        dontRemind.value = false
        dialogVisible.value = true
      }
      return
    }

    enabled.value = true
  }

  function markLoaded() {
    if (!available.value || !enabled.value || manualPreference)
      return
    if (detectionStarted || detectionCancelled)
      return
    if (readStorage(STORAGE_KEYS.webWallpaperPerf))
      return

    detectionStarted = true
    void runPerformanceDetection()
  }

  return {
    available,
    mobile,
    enabled,
    dialogVisible,
    dontRemind,
    toggle,
    setEnabled,
    enableAnyway,
    dismissDialog,
    initClientState,
    markLoaded,
  }
}
