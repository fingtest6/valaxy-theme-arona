export interface AppsConfig {
  /**
   * 文件 App（Posts 路径树）
   * @default true
   */
  files?: boolean
  /**
   * 笔记 App（读取 pages/notes 下的 md）
   * @default true
   */
  notes?: boolean
  /**
   * 相册 App（读取 photos 目录）
   * @default true
   */
  album?: boolean
}

export interface ResolvedAppsConfig {
  files: boolean
  notes: boolean
  album: boolean
}

/**
 * 始终由主题接管的旧页面路径。
 */
const APP_ALWAYS_ROUTES: Record<string, string> = {
  '/archives': 'archive',
  '/tags': 'search',
  '/about': 'about',
}

export function resolveAppsConfig(config?: AppsConfig | null): ResolvedAppsConfig {
  return {
    files: config?.files !== false,
    notes: config?.notes !== false,
    album: config?.album !== false,
  }
}

export function resolveAppRouteMap(config?: AppsConfig | null): Record<string, string> {
  const apps = resolveAppsConfig(config)
  const map: Record<string, string> = { ...APP_ALWAYS_ROUTES }

  if (apps.files)
    map['/categories'] = 'files'
  if (apps.notes)
    map['/notes'] = 'notes'
  if (apps.album) {
    map['/album'] = 'album'
    map['/photos'] = 'album'
  }

  return map
}

export function isAppEnabled(appId: string, config?: AppsConfig | null): boolean {
  const apps = resolveAppsConfig(config)
  if (appId === 'files')
    return apps.files
  if (appId === 'notes')
    return apps.notes
  if (appId === 'album')
    return apps.album
  return true
}

export function normalizeAppRoute(path: string): string {
  const normalized = path.replace(/\/+$/, '')
  return normalized || '/'
}

/**
 * 判断某个路由是否命中主题接管的 App 路径。
 */
export function matchAppRoute(path: string, config?: AppsConfig | null): string | undefined {
  const normalized = normalizeAppRoute(path)
  const routeMap = resolveAppRouteMap(config)

  for (const [appPath, appId] of Object.entries(routeMap)) {
    if (normalized === appPath || normalized.startsWith(`${appPath}/`))
      return appId
  }

  return undefined
}
