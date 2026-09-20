import type { Post } from 'valaxy'
import { computed, reactive } from 'vue'
import { DOCK_HEIGHT, MENUBAR_HEIGHT, MOBILE_BREAKPOINT, ST_DEFAULT_ACCENT } from '../shared/layout'

export type AppId = 'articles' | 'files' | 'notes' | 'album' | 'archive' | 'search' | 'friends' | 'about' | 'settings' | 'browser'

export type ArticleDisplayMode = 'fullscreen' | 'window'

export type WindowStyle = 'mac' | 'windows'

/**
 * 打开文章窗口所需的最小字段
 *
 * 完整 `Post` 只在文章路由下存在；文件 / 搜索应用只提供路径与标题。
 */
export type ArticleInput = Partial<Post> & { path?: string }

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
  post?: ArticleInput
  /**
   * 窗口正在播放关闭动画，稍后从列表移除；期间再次打开可取消关闭
   */
  closing?: boolean
}

export interface AppMeta {
  id: AppId
  title: string
  icon: string
  /** Dock 图标底色（与应用定义放在一起，避免再维护一份平行映射） */
  color: string
  defaultWidth: number
  defaultHeight: number
}

/**
 * 固定任务栏应用
 */
export const APPS: AppMeta[] = [
  { id: 'articles', title: '文章', icon: 'i-ri-file-list-3-line', color: 'linear-gradient(135deg, #2f80ed, #56ccf2)', defaultWidth: 560, defaultHeight: 640 },
  { id: 'files', title: '文件', icon: 'i-ri-folder-open-line', color: 'linear-gradient(135deg, #f59e0b, #fbbf24)', defaultWidth: 660, defaultHeight: 600 },
  { id: 'notes', title: '笔记', icon: 'i-ri-sticky-note-line', color: 'linear-gradient(135deg, #14b8a6, #2dd4bf)', defaultWidth: 700, defaultHeight: 600 },
  { id: 'album', title: '相册', icon: 'i-ri-gallery-line', color: 'linear-gradient(135deg, #ec4899, #f472b6)', defaultWidth: 780, defaultHeight: 620 },
  { id: 'archive', title: '归档', icon: 'i-ri-archive-line', color: 'linear-gradient(135deg, #f2994a, #f2c94c)', defaultWidth: 640, defaultHeight: 620 },
  { id: 'search', title: '搜索', icon: 'i-ri-search-line', color: 'linear-gradient(135deg, #6366f1, #818cf8)', defaultWidth: 600, defaultHeight: 620 },
  { id: 'friends', title: '友链', icon: 'i-ri-links-line', color: 'linear-gradient(135deg, #9b51e0, #bb6bd9)', defaultWidth: 560, defaultHeight: 560 },
  { id: 'about', title: '关于', icon: 'i-ri-information-line', color: 'linear-gradient(135deg, #27ae60, #6fcf97)', defaultWidth: 520, defaultHeight: 520 },
  { id: 'browser', title: '浏览器', icon: 'i-ri-globe-line', color: 'linear-gradient(135deg, #00b4d8, #90e0ef)', defaultWidth: 960, defaultHeight: 640 },
]

const SETTINGS_META: AppMeta = {
  id: 'settings',
  title: '设置',
  icon: 'i-ri-settings-3-line',
  color: 'linear-gradient(135deg, #6b7280, #9ca3af)',
  defaultWidth: 480,
  defaultHeight: 460,
}

const APP_META_MAP = new Map<AppId, AppMeta>([
  ...APPS.map(a => [a.id, a] as const),
  ['settings', SETTINGS_META],
])

const APP_IDS = new Set<AppId>([
  ...APPS.map(a => a.id),
  SETTINGS_META.id,
])

export function isAppId(value: unknown): value is AppId {
  return typeof value === 'string' && APP_IDS.has(value as AppId)
}

let uid = 0
let modeInitialized = false
let styleInitialized = false

/**
 * 窗口关闭动画时长（与 Window.vue 的 st-window-out 动画保持一致）
 */
const WINDOW_CLOSE_MS = 260

function createId(prefix = 'win') {
  uid += 1
  return `${prefix}-${uid}`
}

const state = reactive({
  windows: [] as DesktopWindow[],
  zCounter: 10,
  activeId: '',
  accent: ST_DEFAULT_ACCENT,
  displayMode: 'fullscreen' as ArticleDisplayMode,
  windowStyle: 'mac' as WindowStyle,
  browserUnlocked: false,
})

const closeTimers = new Map<string, ReturnType<typeof setTimeout>>()

function centerCoords(width: number, height: number) {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280
  const h = typeof window !== 'undefined' ? window.innerHeight : 800
  // 菜单栏与 Dock 占据的空间（与 --st-menubar-h / --st-dock-h 保持一致）
  const usableH = h - MENUBAR_HEIGHT - DOCK_HEIGHT
  return {
    x: Math.round(Math.max(8, (w - width) / 2)),
    y: Math.round(MENUBAR_HEIGHT + Math.max(8, (usableH - height) / 2)),
  }
}

/**
 * 移动端视口（与 useIsMobile 的断点保持一致）
 */
function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
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
  const win = state.windows.find(w => w.id === id)
  // 正在关闭的窗口不再响应聚焦
  if (!win || win.closing)
    return
  state.zCounter += 1
  win.z = state.zCounter
  win.minimized = false
  state.activeId = id
}

/**
 * 取消关闭动画，让窗口重新可用（快速重开同一窗口时无缝衔接）
 */
function cancelClose(win: DesktopWindow) {
  const timer = closeTimers.get(win.id)
  if (timer) {
    clearTimeout(timer)
    closeTimers.delete(win.id)
  }
  win.closing = false
}

function removeWindow(id: string) {
  const index = state.windows.findIndex(w => w.id === id)
  if (index === -1)
    return
  state.windows.splice(index, 1)
  if (state.activeId === id)
    state.activeId = state.windows[state.windows.length - 1]?.id || ''
}

export function useDesktop() {
  const activeWindow = computed(() =>
    state.windows.find(w => w.id === state.activeId && !w.minimized && !w.closing) || null,
  )

  const articleWindow = computed(() =>
    state.windows.find(w => w.app === 'article' && !w.closing) || null,
  )

  const articleWindows = computed(() =>
    state.windows.filter(w => w.app === 'article'),
  )

  // 包含正在关闭的窗口，保证关闭动画期间仍渲染在桌面上
  const readerWindow = computed(() =>
    state.windows.find(w => w.app === 'reader') || null,
  )

  /**
   * 打开（或聚焦）一个任务栏应用窗口
   */
  function openApp(app: AppId) {
    const meta = APP_META_MAP.get(app) || SETTINGS_META
    const existing = state.windows.find(w => w.app === app)
    if (existing) {
      cancelClose(existing)
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
    const existing = state.windows.find(w => w.app === 'reader')
    if (existing) {
      cancelClose(existing)
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
  function openArticle(post: ArticleInput) {
    const path = post.path || ''
    const existing = state.windows.find(w => w.app === 'article' && w.postPath === path)
    if (existing) {
      cancelClose(existing)
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

  function closeWindow(id: string) {
    const win = state.windows.find(w => w.id === id)
    if (!win)
      return
    // 无 DOM 环境（SSG）没有动画，直接移除
    if (typeof window === 'undefined') {
      removeWindow(id)
      return
    }
    if (win.closing)
      return
    win.closing = true
    if (state.activeId === id) {
      const next = [...state.windows].reverse().find(w => !w.minimized && !w.closing && w.id !== id)
      state.activeId = next?.id || ''
    }
    const timer = setTimeout(() => {
      closeTimers.delete(id)
      removeWindow(id)
    }, WINDOW_CLOSE_MS)
    closeTimers.set(id, timer)
  }

  function minimizeWindow(id: string) {
    const win = state.windows.find(w => w.id === id)
    if (!win || win.closing)
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
    if (!win || win.closing)
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

  function setWindowStyle(style: WindowStyle) {
    state.windowStyle = style
  }

  function setBrowserUnlocked(unlocked: boolean) {
    state.browserUnlocked = unlocked
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
   * 仅在首次时初始化窗口样式（组件因布局切换重挂载时保留运行时选择）
   */
  function initWindowStyle(style: WindowStyle) {
    if (!styleInitialized) {
      state.windowStyle = style
      styleInitialized = true
    }
  }

  /**
   * 重置窗口状态（用于 SSG 多页面渲染之间避免状态泄漏）
   */
  function reset() {
    closeTimers.forEach((timer) => {
      clearTimeout(timer)
    })
    closeTimers.clear()
    state.windows.splice(0)
    state.activeId = ''
    state.zCounter = 10
    uid = 0
    styleInitialized = false
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
    windowStyle: computed(() => state.windowStyle),
    browserUnlocked: computed(() => state.browserUnlocked),
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
    setBrowserUnlocked,
    setWindowStyle,
    initDisplayMode,
    initWindowStyle,
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
