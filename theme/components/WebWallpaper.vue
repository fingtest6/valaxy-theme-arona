<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useWebWallpaper } from '../composables'
import { wait } from '../shared/wait'
import { WALLPAPER_WEB_SW_FILENAME } from '../shared/wallpaper'

const props = withDefaults(defineProps<{
  /**
   * 网页壁纸入口地址（已是最终 URL，包含 base）
   */
  url: string
  /**
   * requestIdleCallback 最长等待时间
   */
  idleTimeout?: number
  /**
   * 是否注册 Service Worker 缓存
   */
  cache?: boolean
  /**
   * 是否允许鼠标交互
   */
  interactive?: boolean
}>(), {
  idleTimeout: 1500,
  cache: false,
  interactive: false,
})

const { markLoaded, setEnabled } = useWebWallpaper()

const shouldRender = ref(false)
const loaded = ref(false)
/** iframe 里加载到的其实是博客自身（资源缺失 + 托管 SPA 回退），已放弃网页壁纸 */
const selfEmbedded = ref(false)
let disposed = false

// 卸载时需要取消的待执行句柄
let frameId = 0
let idleId: number | undefined
let timerId: ReturnType<typeof setTimeout> | undefined

function cancelPending() {
  if (frameId) {
    cancelAnimationFrame(frameId)
    frameId = 0
  }
  if (idleId !== undefined) {
    if (typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function')
      window.cancelIdleCallback(idleId)
    idleId = undefined
  }
  if (timerId !== undefined) {
    clearTimeout(timerId)
    timerId = undefined
  }
}

onBeforeUnmount(() => {
  disposed = true
  cancelPending()
})

function onFrameLoad() {
  loaded.value = true
  markLoaded()
}

/**
 * iframe 里是不是加载到了博客自己？
 *
 * dev server 与 Netlify 等托管会把不存在的路径回退到 index.html，壁纸地址一旦失效
 * （目录缺失 / 路径写错），iframe 里就会再跑一份博客：桌面被一层层套娃渲染。
 * 同源文档才读得到，看到 Valaxy 生成的页面就判定为自嵌套并停掉网页壁纸。
 */
function isBlogDocument(doc: Document | null) {
  if (!doc)
    return false
  try {
    return !!doc.querySelector('#valaxy-teleports')
      || !!doc.querySelector('meta[name="generator"][content^="Valaxy"]')
  }
  catch {
    return false
  }
}

function handleFrameLoad(event: Event) {
  const frame = event.target as HTMLIFrameElement
  if (isBlogDocument(frame.contentDocument)) {
    selfEmbedded.value = true
    loaded.value = false
    setEnabled(false, false)
    console.warn('[valaxy-theme-arona] 网页壁纸地址返回的是博客自身(可能是壁纸资源缺失)已停止加载网页壁纸')
    return
  }
  onFrameLoad()
}

/**
 * 注册仅作用于网页壁纸目录的 Service Worker
 */
async function registerCacheServiceWorker() {
  if (!import.meta.env.PROD || !props.cache || !props.url)
    return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator))
    return

  try {
    const pageUrl = new URL(props.url, window.location.href)
    if (pageUrl.origin !== window.location.origin)
      return

    // 入口为无扩展名的目录时，相对解析的 SW 路径会落到上层目录，此时跳过注册
    if (!pageUrl.pathname.endsWith('/') && !/\.[^/]+$/.test(pageUrl.pathname))
      return

    const swUrl = new URL(WALLPAPER_WEB_SW_FILENAME, pageUrl)
    await navigator.serviceWorker.register(swUrl.pathname)

    // 等待 SW 就绪，确保首次加载的资源也能进入缓存；超时则直接继续。
    // ready 可能长期 pending 或 reject，这里自行兜底避免未处理的 rejection。
    await Promise.race([
      navigator.serviceWorker.ready.catch(() => undefined),
      wait(Math.min(props.idleTimeout, 1200)),
    ])
  }
  catch {
    // SW 注册失败不影响网页壁纸加载
  }
}

async function start() {
  if (disposed)
    return

  if (props.cache)
    await registerCacheServiceWorker()

  if (disposed)
    return

  shouldRender.value = true
}

onMounted(() => {
  // 先让首屏完成渲染，再在空闲时挂载网页壁纸
  frameId = requestAnimationFrame(() => {
    frameId = 0
    if (disposed)
      return

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => {
        idleId = undefined
        void start()
      }, { timeout: props.idleTimeout })
    }
    else {
      timerId = setTimeout(() => {
        timerId = undefined
        void start()
      }, Math.min(props.idleTimeout, 400))
    }
  })
})
</script>

<template>
  <div
    class="web-wallpaper"
    :class="{ 'is-loaded': loaded, 'is-interactive': interactive && loaded }"
    aria-hidden="true"
  >
    <iframe
      v-if="shouldRender && !selfEmbedded"
      class="web-wallpaper__frame"
      :src="url"
      title="网页壁纸"
      allow="autoplay; fullscreen; gamepad"
      scrolling="no"
      frameborder="0"
      tabindex="-1"
      loading="lazy"
      @load="handleFrameLoad"
    />
  </div>
</template>

<style scoped>
.web-wallpaper {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.7s var(--st-ease-in-out, ease);
  will-change: opacity;
}

.web-wallpaper.is-loaded {
  opacity: 1;
}

/* 加载完成后才允许点击穿透到网页壁纸 */
.web-wallpaper.is-loaded.is-interactive {
  pointer-events: auto;
}

.web-wallpaper__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
}
</style>
