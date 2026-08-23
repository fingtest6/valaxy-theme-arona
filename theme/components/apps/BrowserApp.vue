<script setup lang="ts">
import { ref } from 'vue'

const currentUrl = typeof window !== 'undefined' ? window.location.href : 'about:blank'
const iframeKey = ref(0)

function buildBrowserUrl(raw: string) {
  if (typeof window === 'undefined')
    return raw
  try {
    const u = new URL(raw, window.location.origin)
    if (u.origin !== window.location.origin)
      return u.toString()
    const depth = Number(u.searchParams.get('browser') || 0)
    u.searchParams.set('browser', String(depth + 1))
    return u.toString()
  }
  catch {
    return raw
  }
}

const url = ref(buildBrowserUrl(currentUrl))
const inputUrl = ref(currentUrl)

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
  inputUrl.value = currentUrl
  url.value = buildBrowserUrl(currentUrl)
  iframeKey.value += 1
}
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
        :key="iframeKey"
        :src="url"
        class="browser-app__frame"
        allow="fullscreen"
      />
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
  color: var(--va-c-text, #333);
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
</style>
