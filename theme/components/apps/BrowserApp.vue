<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// SSR 与水合首帧使用同一占位值，真实地址在挂载后写入，避免水合不一致
const PLACEHOLDER_URL = 'about:blank'

/**
 * 本站页面最多被嵌套的层数。
 *
 * 浏览器 App 默认打开当前页面，而当前页面本身可能带着 `?app=browser`
 * （点 Dock 里的浏览器图标就会写进地址栏），若不限制就会一层层套下去：
 * 每一层都会重新渲染整个桌面（Dock、菜单栏、窗口），看起来像「生成了好几次」。
 * 所以本站页面只允许嵌一层，更深的嵌套改为提示。
 */
const MAX_SELF_EMBED_DEPTH = 1

/** 当前文档自身的嵌套层级（顶层为 0，由地址栏上的 ?browser=N 标记） */
function readEmbedDepth() {
  if (typeof window === 'undefined')
    return 0
  const depth = Number(new URLSearchParams(window.location.search).get('browser') || 0)
  return Number.isFinite(depth) && depth > 0 ? depth : 0
}

const embedDepth = readEmbedDepth()

const currentUrl = ref(PLACEHOLDER_URL)
const iframeKey = ref(0)

function isSameOriginUrl(raw: string) {
  if (typeof window === 'undefined')
    return true
  try {
    return new URL(raw, window.location.href).origin === window.location.origin
  }
  catch {
    return false
  }
}

function buildBrowserUrl(raw: string) {
  if (typeof window === 'undefined')
    return raw
  try {
    const u = new URL(raw, window.location.origin)
    if (u.origin !== window.location.origin)
      return u.toString()
    // 被嵌入的副本不要再自动打开浏览器 App，否则就是自己套自己
    if (u.searchParams.get('app') === 'browser')
      u.searchParams.delete('app')
    const depth = Number(u.searchParams.get('browser') || 0)
    u.searchParams.set('browser', String(depth + 1))
    return u.toString()
  }
  catch {
    return raw
  }
}

const url = ref(PLACEHOLDER_URL)
const inputUrl = ref(PLACEHOLDER_URL)

onMounted(() => {
  currentUrl.value = window.location.href
  inputUrl.value = currentUrl.value
  url.value = buildBrowserUrl(currentUrl.value)
})

function normalizeUrl(raw: string) {
  const value = raw.trim()
  if (!value)
    return value
  if (/^https?:\/\//i.test(value) || value.startsWith('//'))
    return value
  if (/^localhost(?::\d+)?(?:[/?#]|$)/i.test(value))
    return `http://${value}`
  return `https://${value}`
}

function navigate() {
  const raw = inputUrl.value.trim()
  if (!raw)
    return
  const normalized = normalizeUrl(raw)
  inputUrl.value = normalized
  url.value = buildBrowserUrl(normalized)
  iframeKey.value += 1
}

function refresh() {
  iframeKey.value += 1
}

function goHome() {
  inputUrl.value = currentUrl.value
  url.value = buildBrowserUrl(currentUrl.value)
  iframeKey.value += 1
}

/** 嵌套已达上限时不再渲染本站页面（外部网址仍然照常浏览） */
const showFrame = computed(() => !(embedDepth >= MAX_SELF_EMBED_DEPTH && isSameOriginUrl(url.value)))
</script>

<template>
  <div class="browser-app">
    <div class="browser-app__toolbar">
      <button class="browser-app__btn" title="刷新" @click="refresh">
        <i i-ri-refresh-line />
      </button>
      <div class="browser-app__address">
        <i i-ri-lock-line />
        <input
          v-model="inputUrl"
          class="browser-app__input"
          type="text"
          spellcheck="false"
          @keydown.enter="navigate"
        >
      </div>
      <button class="browser-app__btn" title="主页" @click="goHome">
        <i i-ri-home-line />
      </button>
    </div>

    <div class="browser-app__content">
      <iframe
        v-if="showFrame"
        :key="iframeKey"
        :src="url"
        class="browser-app__frame"
        allow="fullscreen"
      />
      <div v-else class="browser-app__blocked">
        <i i-ri-globe-line class="browser-app__blocked-icon" />
        <p class="browser-app__blocked-title">
          这里已经是「博客里的博客」了
        </p>
        <p class="browser-app__blocked-desc">
          为避免无限套娃，本站页面最多嵌套 {{ MAX_SELF_EMBED_DEPTH }} 层。在上方地址栏输入其它网址仍可正常浏览。
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.browser-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

html.dark .browser-app {
  background: #1e1e22;
}

.browser-app__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

html.dark .browser-app__toolbar {
  background: rgba(255, 255, 255, 0.06);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.browser-app__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--va-c-text);
  font-size: 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.browser-app__btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

html.dark .browser-app__btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.browser-app__address {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.65);
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

html.dark .browser-app__address {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.65);
}

.browser-app__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: 12px;
}

.browser-app__content {
  flex: 1;
  min-height: 0;
}

.browser-app__frame {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

html.dark .browser-app__frame {
  background: #1e1e22;
}

.browser-app__blocked {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  background: #fff;
  color: var(--va-c-text);
}

html.dark .browser-app__blocked {
  background: #1e1e22;
}

.browser-app__blocked-icon {
  font-size: 28px;
  opacity: 0.5;
}

.browser-app__blocked-title {
  font-size: 14px;
  font-weight: 600;
}

.browser-app__blocked-desc {
  max-width: 32em;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  line-height: 1.6;
}

html.dark .browser-app__blocked-desc {
  color: rgba(255, 255, 255, 0.6);
}
</style>
