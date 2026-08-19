import type { Post } from 'valaxy'
import { computed, reactive } from 'vue'

export type AppId = 'articles' | 'archive' | 'search' | 'friends' | 'about' | 'settings'

export type ArticleDisplayMode = 'fullscreen' | 'window'

export interface DesktopWindow {
  id: string
  /**
   * 应用标识：`article` 文章内容窗口，`reader` 全屏阅读器
   */
  app: AppId | 'article' | 'reader'
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  z: number
  minimized: boolean
  maximized: boolean
  /**
   * 文章窗口对应的文章路径
   */
  postPath?: string
  post?: Post
}

export interface AppMeta {
  id: AppId
  title: string
  icon: string
  defaultWidth: number
  defaultHeight: number
}

/**
 * 固定任务栏应用
 */
export const APPS: AppMeta[] = [
  { id: 'articles', title: '文章', icon: 'i-ri-file-list-3-line', defaultWidth: 560, defaultHeight: 640 },
  { id: 'archive', title: '归档', icon: 'i-ri-archive-line', defaultWidth: 640, defaultHeight: 620 },
  { id: 'search', title: '搜索', icon: 'i-ri-search-line', defaultWidth: 600, defaultHeight: 620 },
  { id: 'friends', title: '友链', icon: 'i-ri-links-line', defaultWidth: 560, defaultHeight: 560 },
  { id: 'about', title: '关于', icon: 'i-ri-information-line', defaultWidth: 520, defaultHeight: 520 },
]

const SETTINGS_META: AppMeta = {
  id: 'settings',
  title: '设置',
  icon: 'i-ri-settings-3-line',
  defaultWidth: 480,
  defaultHeight: 460,
}

const APP_META_MAP = new Map<AppId, AppMeta>([
  ...APPS.map(a => [a.id, a] as const),
  ['settings', SETTINGS_META],
])

let uid = 0
let modeInitialized = false

function createId(prefix = 'win') {
  uid += 1
  return `${prefix}-${uid}`
}

const state = reactive({
  windows: [] as DesktopWindow[],
  zCounter: 10,
  activeId: '',
  accent: '#0078E7',
  displayMode: 'fullscreen' as ArticleDisplayMode,
})

function centerCoords(width: number, height: number) {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280
  const h = typeof window !== 'undefined' ? window.innerHeight : 800
  // 菜单栏与 Dock 占据的空间
  const menuBar = 32
  const dock = 96
  const usableH = h - menuBar - dock
  return {
    x: Math.round(Math.max(8, (w - width) / 2)),
    y: Math.round(menuBar + Math.max(8, (usableH - height) / 2)),
  }
}

/**
 * 移动端视口（与 useMobile 的 768px 断点保持一致）
 */
function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth <= 768
}

/**
 * 将窗口尺寸限制在视口内，避免小屏下窗口超出屏幕
 */
function clampToViewport(width: number, height: number) {
  if (typeof window === 'undefined')
    return { width, height }
  const maxW = Math.max(320, window.innerWidth - 32)
  const maxH = Math.max(240, window.innerHeight - 140)
  return {
    width: Math.min(width, maxW),
    height: Math.min(height, maxH),
  }
}

function focus(id: string) {
  if (!id)
    return
  state.zCounter += 1
  const win = state.windows.find(w => w.id === id)
  if (win) {
    win.z = state.zCounter
    win.minimized = false
  }
  state.activeId = id
}

export function useDesktop() {
  const activeWindow = computed(() =>
    state.windows.find(w => w.id === state.activeId && !w.minimized) || null,
  )

  const articleWindow = computed(() =>
    state.windows.find(w => w.app === 'article') || null,
  )

  const articleWindows = computed(() =>
    state.windows.filter(w => w.app === 'article'),
  )

  const readerWindow = computed(() =>
    state.windows.find(w => w.app === 'reader') || null,
  )

  function findAppWindow(app: AppId) {
    return state.windows.find(w => w.app === app)
  }

  /**
   * 打开（或聚焦）一个任务栏应用窗口
   */
  function openApp(app: AppId) {
    const meta = APP_META_MAP.get(app) || SETTINGS_META
    const existing = findAppWindow(app)
    if (existing) {
      existing.minimized = false
      existing.maximized = isMobileViewport() || existing.maximized
      focus(existing.id)
      return existing
    }
    const mobile = isMobileViewport()
    const { width, height } = clampToViewport(meta.defaultWidth, meta.defaultHeight)
    const { x, y } = mobile ? { x: 0, y: 0 } : centerCoords(width, height)
    const win: DesktopWindow = {
      id: createId(app),
      app,
      title: meta.title,
      icon: meta.icon,
      x,
      y,
      width,
      height,
      z: 0,
      minimized: false,
      maximized: mobile,
    }
    state.windows.push(win)
    focus(win.id)
    return win
  }

  /**
   * 打开（或聚焦）全屏阅读器窗口
   */
  function openReader() {
    const existing = findWindow('reader')
    if (existing) {
      existing.minimized = false
      existing.maximized = true
      focus(existing.id)
      return existing
    }
    const { width, height } = clampToViewport(1080, 700)
    const { x, y } = centerCoords(width, height)
    const win: DesktopWindow = {
      id: createId('reader'),
      app: 'reader',
      title: '文章',
      icon: 'i-ri-file-list-3-line',
      x,
      y,
      width,
      height,
      z: 0,
      minimized: false,
      maximized: true,
    }
    state.windows.push(win)
    focus(win.id)
    return win
  }

  /**
   * 打开文章窗口（窗口模式）。同一路径去重聚焦，可同时打开多篇。
   */
  function openArticle(post: Post) {
    const path = post.path || ''
    const existing = state.windows.find(w => w.app === 'article' && w.postPath === path)
    if (existing) {
      existing.post = post
      existing.title = resolveTitle(post.title)
      focus(existing.id)
      return existing
    }
    const { width, height } = clampToViewport(760, 640)
    const { x, y } = centerCoords(width, height)
    const win: DesktopWindow = {
      id: createId('article'),
      app: 'article',
      title: resolveTitle(post.title),
      icon: 'i-ri-file-text-line',
      x,
      y,
      width,
      height,
      z: 0,
      minimized: false,
      maximized: false,
      postPath: path,
      post,
    }
    state.windows.push(win)
    focus(win.id)
    return win
  }

  function findWindow(id: string) {
    return state.windows.find(w => w.id === id)
  }

  function closeWindow(id: string) {
    const index = state.windows.findIndex(w => w.id === id)
    if (index === -1)
      return
    state.windows.splice(index, 1)
    if (state.activeId === id)
      state.activeId = state.windows[state.windows.length - 1]?.id || ''
  }

  function minimizeWindow(id: string) {
    const win = state.windows.find(w => w.id === id)
    if (!win)
      return
    win.minimized = !win.minimized
    if (win.minimized) {
      // 聚焦下一个未最小化窗口
      const next = [...state.windows].reverse().find(w => !w.minimized && w.id !== id)
      state.activeId = next?.id || ''
    }
    else {
      focus(id)
    }
  }

  function toggleMaximize(id: string) {
    const win = state.windows.find(w => w.id === id)
    if (!win)
      return
    win.maximized = !win.maximized
    focus(id)
  }

  function updatePosition(id: string, x: number, y: number) {
    const win = state.windows.find(w => w.id === id)
    if (!win)
      return
    win.x = x
    win.y = y
  }

  function updateSize(id: string, width: number, height: number) {
    const win = state.windows.find(w => w.id === id)
    if (!win)
      return
    win.width = width
    win.height = height
  }

  function setAccent(color: string) {
    state.accent = color
  }

  function setDisplayMode(mode: ArticleDisplayMode) {
    state.displayMode = mode
  }

  /**
   * 仅在首次时初始化显示模式（组件因布局切换重挂载时保留运行时模式）
   */
  function initDisplayMode(mode: ArticleDisplayMode) {
    if (!modeInitialized) {
      state.displayMode = mode
      modeInitialized = true
    }
  }

  /**
   * 重置窗口状态（用于 SSG 多页面渲染之间避免状态泄漏）
   */
  function reset() {
    state.windows.splice(0)
    state.activeId = ''
    state.zCounter = 10
    uid = 0
    modeInitialized = false
  }

  return {
    windows: computed(() => state.windows),
    activeId: computed(() => state.activeId),
    activeWindow,
    articleWindow,
    articleWindows,
    readerWindow,
    accent: computed(() => state.accent),
    displayMode: computed(() => state.displayMode),
    openApp,
    openReader,
    openArticle,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focus,
    updatePosition,
    updateSize,
    setAccent,
    setDisplayMode,
    initDisplayMode,
    reset,
  }
}

export function resolveTitle(title: unknown): string {
  if (!title)
    return '未命名'
  if (typeof title === 'string')
    return title.trim() || '未命名'
  if (typeof title === 'object') {
    const t = title as Record<string, string>
    return t.zh || t['zh-CN'] || t.en || t.default || Object.values(t)[0] || '未命名'
  }
  return String(title) || '未命名'
}
