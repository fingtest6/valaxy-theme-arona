<script setup lang="ts">
import { useAppStore } from 'valaxy'
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeConfig } from '../composables'
import type { DesktopWindow } from '../composables/desktop'
import { resolveTitle, useDesktop } from '../composables/desktop'
import AboutApp from './apps/AboutApp.vue'
import ArchiveApp from './apps/ArchiveApp.vue'
import ArticleApp from './apps/ArticleApp.vue'
import ArticlesApp from './apps/ArticlesApp.vue'
import FriendsApp from './apps/FriendsApp.vue'
import ReaderApp from './apps/ReaderApp.vue'
import SettingsApp from './apps/SettingsApp.vue'
import Dock from './Dock.vue'
import MenuBar from './MenuBar.vue'
import Window from './Window.vue'

const desktop = useDesktop()
const route = useRoute()
const router = useRouter()
const themeConfig = useThemeConfig()
const appStore = useAppStore()

// SSG 渲染时重置窗口状态，避免多页面之间状态泄漏
if (import.meta.env.SSR)
  desktop.reset()

const isArticleRoute = computed(() => route.path.startsWith('/posts/'))

// 移动端仅支持全屏模式
const isMobile = computed(() => appStore.isMobile)
const effectiveMode = computed(() =>
  isMobile.value ? 'fullscreen' : desktop.displayMode.value,
)

const appComponents: Record<string, any> = {
  articles: ArticlesApp,
  archive: ArchiveApp,
  friends: FriendsApp,
  about: AboutApp,
  settings: SettingsApp,
}

function componentFor(win: DesktopWindow) {
  return appComponents[win.app]
}

// ---------- 文章显示模式 ----------
// 首次使用配置默认值，重挂载时保留运行时模式
const configuredMode = themeConfig.value.articleDisplayMode || 'fullscreen'
desktop.initDisplayMode(configuredMode)

// ---------- 强调色 ----------
function applyAccent(color: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--st-c-brand', color)
    document.documentElement.style.setProperty('--st-accent', color)
  }
}
const savedAccent = typeof localStorage !== 'undefined' ? localStorage.getItem('arona-accent') : null
if (savedAccent)
  desktop.setAccent(savedAccent)
else if (themeConfig.value.colors?.primary)
  desktop.setAccent(themeConfig.value.colors.primary)
watch(() => desktop.accent.value, (c) => {
  applyAccent(c)
  if (typeof localStorage !== 'undefined')
    localStorage.setItem('arona-accent', c)
}, { immediate: true })

// ---------- 文章组件解析 ----------
function postComponent(path?: string) {
  if (!path)
    return undefined
  const clean = path.replace(/\/$/, '')
  const r = router.getRoutes().find(r => (r.path || '').replace(/\/$/, '') === clean)
  return (r?.components?.default || undefined) as any
}

const currentPostComponent = computed(() =>
  isArticleRoute.value ? postComponent(route.path) : undefined,
)

function routeToPost() {
  const fm = (route.meta as any)?.frontmatter || {}
  return { path: route.path, title: fm.title, date: fm.date, ...fm } as any
}

// ---------- 路由 / 模式与窗口形态协调 ----------
function syncWindows(openHomeWindow: boolean) {
  if (isArticleRoute.value) {
    const title = resolveTitle((route.meta as any)?.frontmatter?.title) || '文章'
    if (effectiveMode.value === 'fullscreen') {
      // 全屏：打开/保留阅读器并更新标题
      if (!desktop.readerWindow.value)
        desktop.openReader()
      const rw = desktop.readerWindow.value
      if (rw)
        rw.title = title
    }
    else {
      // 窗口：关闭阅读器，打开文章窗口
      if (desktop.readerWindow.value)
        desktop.closeWindow(desktop.readerWindow.value.id)
      desktop.openArticle(routeToPost())
    }
  }
  else {
    // 首页
    if (effectiveMode.value === 'fullscreen') {
      const rw = desktop.readerWindow.value
      if (rw) {
        rw.title = '文章'
      }
      else if (openHomeWindow) {
        desktop.openReader()
      }
    }
    else if (openHomeWindow && !desktop.windows.value.some(w => w.app === 'articles')) {
      desktop.openApp('articles')
    }
  }
}

watch(() => route.path, () => syncWindows(false), { immediate: true })
watch(() => desktop.displayMode.value, () => syncWindows(true))
watch(() => isMobile.value, () => syncWindows(true))

onMounted(() => {
  // 挂载后应用 localStorage 中保存的显示模式（避免与 SSG 首屏水合冲突）
  const savedMode = typeof localStorage !== 'undefined' ? localStorage.getItem('arona-article-mode') : null
  if (savedMode === 'fullscreen' || savedMode === 'window')
    desktop.setDisplayMode(savedMode)

  // 确保首页窗口已打开（若模式未变化，上面的 watcher 不会触发）
  syncWindows(true)
})

// ---------- 窗口操作 ----------
function handleMove(id: string, x: number, y: number) {
  desktop.updatePosition(id, x, y)
}

function handleResize(id: string, w: number, h: number) {
  desktop.updateSize(id, w, h)
}

function handleClose(id: string) {
  desktop.closeWindow(id)
}

// 点击后台文章窗口时，切换路由使其成为激活窗口（渲染实时内容）
function handleArticleFocus(id: string) {
  desktop.focus(id)
  const win = desktop.windows.value.find(w => w.id === id)
  if (win && win.app === 'article' && win.postPath && win.postPath !== route.path)
    router.push(win.postPath)
}

// ---------- 壁纸 ----------
const wallpaperImage = computed(() => {
  const wp = themeConfig.value.wallpaper || {}
  if (appStore.isDark && wp.dark)
    return wp.dark
  return wp.light || ''
})
const wallpaperBlur = computed(() => !!themeConfig.value.wallpaper?.blur)
</script>

<template>
  <div class="desktop">
    <!-- 壁纸 -->
    <div
      class="desktop__wallpaper"
      :class="{ 'is-blur': wallpaperBlur }"
      :style="wallpaperImage ? { backgroundImage: `url(${wallpaperImage})` } : undefined"
    />

    <MenuBar />

    <main class="desktop__stage">
      <!-- 应用窗口（文章/阅读器除外） -->
      <Window
        v-for="w in desktop.windows.value.filter(x => x.app !== 'article' && x.app !== 'reader')"
        :key="w.id"
        :window="w"
        @focus="desktop.focus"
        @close="handleClose"
        @minimize="desktop.minimizeWindow"
        @toggle-maximize="desktop.toggleMaximize"
        @move="handleMove"
        @resize="handleResize"
      >
        <component :is="componentFor(w)" :window="w" />
      </Window>

      <!-- 全屏阅读器窗口 -->
      <Window
        v-if="desktop.readerWindow.value"
        :key="desktop.readerWindow.value.id"
        :window="desktop.readerWindow.value"
        @focus="desktop.focus"
        @close="handleClose"
        @minimize="desktop.minimizeWindow"
        @toggle-maximize="desktop.toggleMaximize"
        @move="handleMove"
        @resize="handleResize"
      >
        <ReaderApp
          :component="currentPostComponent"
          :current-path="isArticleRoute ? route.path : ''"
        />
      </Window>

      <!-- 文章窗口（窗口模式，可多个） -->
      <Window
        v-for="w in desktop.articleWindows.value"
        :key="w.id"
        :window="w"
        @focus="handleArticleFocus"
        @close="handleClose"
        @minimize="desktop.minimizeWindow"
        @toggle-maximize="desktop.toggleMaximize"
        @move="handleMove"
        @resize="handleResize"
      >
        <ArticleApp :post="w.post" :component="postComponent(w.postPath)" :active="w.postPath === route.path" />
      </Window>
    </main>

    <Dock />
  </div>
</template>

<style scoped>
.desktop {
  position: fixed;
  inset: 0;
  overflow: hidden;
  font-family: var(--va-font-family-base);
  color: var(--va-c-text, #333);
}

.desktop__wallpaper {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: filter 0.4s ease, background-image 0.4s ease;
}

.desktop__wallpaper.is-blur {
  filter: blur(14px) brightness(0.9);
  transform: scale(1.06);
}

.desktop__stage {
  position: absolute;
  inset: 0;
}
</style>
