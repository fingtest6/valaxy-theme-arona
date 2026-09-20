<script setup lang="ts">
import type { AppId, DesktopWindow } from '../composables/desktop'
import { computed, defineAsyncComponent, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeConfig } from '../composables'
import { isAppId, resolveTitle, useDesktop } from '../composables/desktop'
import { useIsMobile } from '../composables/useIsMobile'
import { isAppEnabled, normalizeAppRoute, resolveAppRouteMap } from '../shared/apps'
import { readStorage, STORAGE_KEYS, writeStorage } from '../shared/storage'
import { toRenderableComponent } from '../utils/component'
import AboutApp from './apps/AboutApp.vue'
import ArchiveApp from './apps/ArchiveApp.vue'
import ArticleApp from './apps/ArticleApp.vue'
import ArticlesApp from './apps/ArticlesApp.vue'
import BrowserApp from './apps/BrowserApp.vue'
import FriendsApp from './apps/FriendsApp.vue'
import ReaderApp from './apps/ReaderApp.vue'
import SearchApp from './apps/SearchApp.vue'
import SettingsApp from './apps/SettingsApp.vue'
import Dock from './Dock.vue'
import GlobalWallpaper from './GlobalWallpaper.vue'
import MenuBar from './MenuBar.vue'
import WebWallpaperPerformanceDialog from './WebWallpaperPerformanceDialog.vue'
import Window from './Window.vue'

const desktop = useDesktop()
const route = useRoute()
const router = useRouter()
const themeConfig = useThemeConfig()

const FileApp = defineAsyncComponent(() => import('./apps/FileApp.vue'))
const NotesApp = defineAsyncComponent(() => import('./apps/NotesApp.vue'))
const AlbumApp = defineAsyncComponent(() => import('./apps/AlbumApp.vue'))

// SSG 渲染时重置窗口状态，避免多页面之间状态泄漏
if (import.meta.env.SSR)
  desktop.reset()

const isArticleRoute = computed(() => route.path.startsWith('/posts/'))

// 移动端仅支持全屏模式
const isMobile = useIsMobile()
const effectiveMode = computed(() =>
  isMobile.value ? 'fullscreen' : desktop.displayMode.value,
)

const appComponents: Record<string, any> = {
  articles: ArticlesApp,
  files: FileApp,
  notes: NotesApp,
  album: AlbumApp,
  archive: ArchiveApp,
  search: SearchApp,
  friends: FriendsApp,
  about: AboutApp,
  settings: SettingsApp,
  browser: BrowserApp,
}

function componentFor(win: DesktopWindow) {
  return appComponents[win.app]
}

// ---------- 应用路由 ----------
function resolveAppFromRoute(): AppId | undefined {
  const routeApp = resolveAppRouteMap(themeConfig.value.apps)[normalizeAppRoute(route.path)]
  if (routeApp && isAppEnabled(routeApp, themeConfig.value.apps))
    return routeApp as AppId

  if (isAppId(route.query.app) && isAppEnabled(route.query.app, themeConfig.value.apps))
    return route.query.app

  return undefined
}
/**
 * 兼容旧页面地址：命中应用路由时直接打开对应窗口，并统一为 /?app=xxx
 */
function applyAppRoute(): boolean {
  const app = resolveAppFromRoute()
  if (!app)
    return false

  desktop.openApp(app)

  if (route.path !== '/' || route.query.app !== app) {
    const query = { ...route.query, app }
    router.replace({ path: '/', query })
  }

  return true
}

// ---------- 文章显示模式 ----------
// 首次使用配置默认值，重挂载时保留运行时模式
const configuredMode = themeConfig.value.articleDisplayMode || 'fullscreen'
desktop.initDisplayMode(configuredMode)

// 窗口样式默认值（首次打开时生效）
const configuredWindowStyle = themeConfig.value.windowStyle || 'mac'
desktop.initWindowStyle(configuredWindowStyle)

// ---------- 强调色 ----------
// --st-accent 定义为 var(--st-c-brand)，因此只需覆写后者
function applyAccent(color: string) {
  if (typeof document !== 'undefined')
    document.documentElement.style.setProperty('--st-c-brand', color)
}
const savedAccent = readStorage(STORAGE_KEYS.accent)
if (savedAccent)
  desktop.setAccent(savedAccent)
else if (themeConfig.value.colors?.primary)
  desktop.setAccent(themeConfig.value.colors.primary)
watch(() => desktop.accent.value, (c) => {
  applyAccent(c)
  writeStorage(STORAGE_KEYS.accent, c)
}, { immediate: true })

// ---------- 文章组件解析 ----------
function postComponent(path?: string) {
  if (!path)
    return undefined
  const clean = path.replace(/\/$/, '')
  const record = router.getRoutes().find(r => (r.path || '').replace(/\/$/, '') === clean)
  // 懒加载路由存的是 () => import(...)，必须包装后才能交给 <component :is>
  return toRenderableComponent(record?.components?.default)
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
      // 全屏：关闭所有文章窗口，打开/保留阅读器并更新标题
      // openReader 内部去重，阅读器若正在播放关闭动画会被取消并保留
      desktop.articleWindows.value.slice().forEach(w => desktop.closeWindow(w.id))
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
      // 全屏首页：关闭所有文章窗口，保留/打开阅读器
      desktop.articleWindows.value.slice().forEach(w => desktop.closeWindow(w.id))
      const rw = desktop.readerWindow.value
      if (openHomeWindow || (rw && !rw.closing))
        desktop.openReader()
      if (rw)
        rw.title = '文章'
    }
    else if (openHomeWindow && !desktop.windows.value.some(w => w.app === 'articles')) {
      desktop.openApp('articles')
    }
  }
}

watch(
  () => [route.path, route.query.app] as const,
  () => {
    if (applyAppRoute())
      return
    syncWindows(false)
  },
  { immediate: true },
)
watch(() => desktop.displayMode.value, () => syncWindows(true))
watch(() => isMobile.value, () => syncWindows(true))

onMounted(() => {
  // 挂载后应用 localStorage 中保存的显示模式（避免与 SSG 首屏水合冲突）
  const savedMode = readStorage(STORAGE_KEYS.articleMode)
  if (savedMode === 'fullscreen' || savedMode === 'window')
    desktop.setDisplayMode(savedMode)

  const savedWindowStyle = readStorage(STORAGE_KEYS.windowStyle)
  if (savedWindowStyle === 'mac' || savedWindowStyle === 'windows')
    desktop.setWindowStyle(savedWindowStyle)

  // 确保首页窗口已打开（若模式未变化，上面的 watcher 不会触发）
  if (!applyAppRoute())
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
</script>

<template>
  <div class="desktop">
    <GlobalWallpaper />
    <WebWallpaperPerformanceDialog />

    <MenuBar />

    <main class="desktop__stage">
      <!-- 应用窗口（文章/阅读器除外） -->
      <Window
        v-for="w in desktop.windows.value.filter(x => x.app !== 'article' && x.app !== 'reader')"
        :key="w.id"
        :window="w"
        :active="desktop.activeId.value === w.id"
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
        :active="desktop.activeId.value === desktop.readerWindow.value.id"
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
        :active="desktop.activeId.value === w.id"
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
  color: var(--va-c-text);
}

.desktop__stage {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 桌面空白区域点击穿透到网页壁纸；窗口、菜单栏与 Dock 保持可交互 */
.desktop__stage > :deep(.mac-window:not(.is-minimized):not(.is-closing)) {
  pointer-events: auto;
}
</style>
