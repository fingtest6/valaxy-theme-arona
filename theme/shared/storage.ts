/**
 * localStorage 键名与读写封装
 *
 * 键名集中在这里，避免字符串散落在各组件；读写都做了 SSR 与隐私模式兜底。
 */
export const STORAGE_KEYS = {
  /** 强调色 */
  accent: 'arona-accent',
  /** 文章显示模式 fullscreen / window */
  articleMode: 'arona-article-mode',
  /** 窗口标题栏样式 mac / windows */
  windowStyle: 'arona-window-style',
  /** 文件应用视图 grid / list */
  fileView: 'arona-file-view',
  /** 网页壁纸开关（manualPreference） */
  webWallpaper: 'arona-web-wallpaper',
  /** 网页壁纸性能检测结果 */
  webWallpaperPerf: 'arona-web-wallpaper-perf',
  /** 网页壁纸性能提示不再弹出 */
  webWallpaperNoTip: 'arona-web-wallpaper-no-perf-tip',
} as const

/** 读取 localStorage；SSR 或不可用时返回 null */
export function readStorage(key: string): string | null {
  if (typeof localStorage === 'undefined')
    return null
  try {
    return localStorage.getItem(key)
  }
  catch {
    return null
  }
}

/** 写入 localStorage；SSR、隐私模式等场景静默忽略 */
export function writeStorage(key: string, value: string): void {
  if (typeof localStorage === 'undefined')
    return
  try {
    localStorage.setItem(key, value)
  }
  catch {
    // 隐私模式等场景忽略
  }
}
