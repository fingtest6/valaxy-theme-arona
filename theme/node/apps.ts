import type { ResolvedValaxyOptions } from 'valaxy'
import type { Plugin } from 'vite'
import type { AlbumData, AlbumPhoto, FileEntry, NoteItem, ThemeConfig } from '../types'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { toAtFS } from 'valaxy'
import { resolveAppsConfig } from '../shared/apps'

const md = new MarkdownIt({
  html: true,
  linkify: true,
})

// 虚拟模块 ID 仅在本插件内部使用；客户端按字面量导入（声明见 types/virtual.d.ts）
const NOTES_VIRTUAL_ID = 'virtual:arona/notes'
const RESOLVED_NOTES_ID = `\0${NOTES_VIRTUAL_ID}`

const ALBUM_VIRTUAL_ID = 'virtual:arona/album'
const RESOLVED_ALBUM_ID = `\0${ALBUM_VIRTUAL_ID}`

const FILES_VIRTUAL_ID = 'virtual:arona/files'
const RESOLVED_FILES_ID = `\0${FILES_VIRTUAL_ID}`

/**
 * 构建期相册图片
 *
 * 字段与客户端 `AlbumPhoto` 保持一致，但：
 * - `src` 到生成虚拟模块时才注入，因此此处可选
 * - 本地图片额外携带 `filePath`，用于生成 import 语句
 */
type AlbumPhotoSource = Omit<AlbumPhoto, 'src'> & {
  filePath?: string
  src?: string
}

/** 构建期相册数据（`photos` 比客户端多一个 `filePath`） */
type AlbumBuildData = Omit<AlbumData, 'photos'> & {
  photos: AlbumPhotoSource[]
}

/** photos/index.md frontmatter 中的单张图片条目 */
interface AlbumIndexPhoto {
  src?: string
  file?: string
  url?: string
  title?: string
  description?: string
}

/** photos/index.md frontmatter */
interface AlbumIndexData {
  title?: string
  description?: string
  photos?: Array<string | AlbumIndexPhoto>
}

function isInsideDir(file: string, dir: string) {
  return file === dir || file.startsWith(`${dir}${path.sep}`)
}

function normalizeDate(value: unknown): string | undefined {
  if (!value)
    return undefined
  if (value instanceof Date)
    return value.toISOString()
  return String(value)
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value))
    return value.map(item => String(item))
  if (value)
    return [String(value)]
  return []
}

async function walkFiles(dir: string, predicate: (filePath: string) => boolean): Promise<string[]> {
  const result: string[] = []

  async function walk(current: string) {
    let entries
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    }
    catch {
      return
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.'))
        continue
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      }
      else if (predicate(fullPath)) {
        result.push(fullPath)
      }
    }
  }

  await walk(dir)
  return result
}

function stripExtension(filename: string) {
  return filename.replace(/\.[^.]+$/, '')
}

function decodePhotoTarget(target: string) {
  return decodeURIComponent(target.split(/[?#]/)[0]).replace(/^\.\//, '').replace(/^\/+/, '')
}

function findPhotoMeta(
  filename: string,
  indexPhotos: Array<string | AlbumIndexPhoto>,
  markdownPhotos: Map<string, { title: string, description: string }>,
) {
  const normalizedFilename = filename.replace(/\\/g, '/')
  const baseName = path.basename(normalizedFilename)
  const baseNameLower = baseName.toLowerCase()

  for (const item of indexPhotos) {
    const entry = typeof item === 'string' ? { src: item } : item
    const rawTarget = decodePhotoTarget(String(entry.src || entry.file || ''))
    if (!rawTarget)
      continue
    if (rawTarget === normalizedFilename || rawTarget.toLowerCase() === normalizedFilename.toLowerCase() || path.basename(rawTarget) === baseName || path.basename(rawTarget).toLowerCase() === baseNameLower) {
      return {
        title: entry.title || '',
        description: entry.description || '',
      }
    }
  }

  for (const [target, meta] of markdownPhotos) {
    if (target === normalizedFilename || target.toLowerCase() === normalizedFilename.toLowerCase() || path.basename(target) === baseName || path.basename(target).toLowerCase() === baseNameLower)
      return meta
  }

  return { title: '', description: '' }
}

function extractMarkdownPhotos(content: string) {
  const images = new Map<string, { title: string, description: string }>()
  const imageRE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g
  let match = imageRE.exec(content)
  while (match) {
    const target = decodePhotoTarget(match[2])
    images.set(target, {
      title: match[1] || '',
      description: match[3] || '',
    })
    match = imageRE.exec(content)
  }
  return images
}

function isExternalUrl(value: string) {
  return /^(?:https?:)?\/\//i.test(value)
}

function getFilenameFromUrl(input: string) {
  try {
    const url = new URL(input, 'http://localhost')
    const segment = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '')
    if (!segment)
      return 'image.jpg'
    return /\.\w+$/.test(segment) ? segment : `${segment}.jpg`
  }
  catch {
    return 'image.jpg'
  }
}

function toPostRoute(relativePath: string) {
  let route = relativePath.replace(/\.md$/i, '')
  if (route === 'index')
    route = ''
  else if (route.endsWith('/index'))
    route = route.slice(0, -6)
  return route ? `/posts/${route}` : '/posts'
}

async function scanMarkdownFiles(dir: string, folder: 'posts' | 'notes'): Promise<FileEntry[]> {
  const files = await walkFiles(dir, file => file.toLowerCase().endsWith('.md'))
  const entries = await Promise.all(files.map(async (file) => {
    const stat = await fs.stat(file)
    const relativePath = path.relative(dir, file).replace(/\\/g, '/')
    const entry: FileEntry = {
      folder,
      name: path.basename(file),
      relativePath,
      type: 'markdown',
      size: stat.size,
      mtime: stat.mtimeMs,
    }
    if (folder === 'posts')
      entry.routePath = toPostRoute(relativePath)
    else
      entry.slug = relativePath.replace(/\.md$/i, '')
    return entry
  }))
  entries.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  return entries
}

async function loadFiles(userRoot: string) {
  const [posts, notes] = await Promise.all([
    scanMarkdownFiles(path.resolve(userRoot, 'pages', 'posts'), 'posts'),
    scanMarkdownFiles(path.resolve(userRoot, 'pages', 'notes'), 'notes'),
  ])
  return { posts, notes }
}

async function loadNotes(userRoot: string) {
  const notesDir = path.resolve(userRoot, 'pages', 'notes')
  const files = await walkFiles(notesDir, file => file.endsWith('.md'))

  const notes = await Promise.all(files.map<Promise<NoteItem & { order: number }>>(async (file) => {
    const raw = await fs.readFile(file, 'utf-8')
    const { data, content } = matter(raw)
    const relativePath = path.relative(notesDir, file).replace(/\\/g, '/')
    const slug = relativePath.replace(/\.md$/, '')
    const headingLine = content.split('\n').find(line => line.startsWith('# '))
    const firstHeading = headingLine?.slice(2).trim()

    return {
      slug,
      title: String(data.title || firstHeading || stripExtension(path.basename(file))),
      date: normalizeDate(data.date),
      tags: normalizeTags(data.tags),
      html: md.render(content),
      order: typeof data.order === 'number' ? data.order : 0,
    }
  }))

  notes.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
  return notes.map(({ order: _order, ...note }) => note)
}

async function loadAlbum(userRoot: string): Promise<AlbumBuildData> {
  const photosDir = path.resolve(userRoot, 'photos')
  const indexPath = path.join(photosDir, 'index.md')

  let indexData: AlbumIndexData = {}
  let indexContent = ''

  try {
    const raw = await fs.readFile(indexPath, 'utf-8')
    const parsed = matter(raw)
    indexData = parsed.data as AlbumIndexData
    indexContent = parsed.content
  }
  catch {
    // photos/index.md 可选
  }

  const markdownPhotos = extractMarkdownPhotos(indexContent)
  const textContent = indexContent.replace(/!\[[^\]]*\]\([^)]*\)/g, '').trim()
  const indexPhotos = Array.isArray(indexData.photos) ? indexData.photos : []

  const imageFiles = await walkFiles(photosDir, file => /\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(file))
  imageFiles.sort((a, b) => path.basename(a).localeCompare(path.basename(b), undefined, { numeric: true }))

  const photos = await Promise.all(imageFiles.map(async (file): Promise<AlbumPhotoSource> => {
    const filename = path.relative(photosDir, file).replace(/\\/g, '/')
    const meta = findPhotoMeta(filename, indexPhotos, markdownPhotos)
    const stat = await fs.stat(file)

    return {
      filePath: file,
      filename,
      title: meta.title || stripExtension(path.basename(file)),
      description: meta.description,
      size: stat.size,
      mtime: stat.mtimeMs,
    }
  }))

  const externalSources = new Set<string>()
  for (const item of indexPhotos) {
    const entry = typeof item === 'string' ? { src: item } : item
    const target = String(entry.src || entry.file || entry.url || '')
    if (!isExternalUrl(target) || externalSources.has(target))
      continue
    externalSources.add(target)
    const filename = getFilenameFromUrl(target)
    photos.push({
      src: target,
      filename,
      title: entry.title || filename,
      description: entry.description || '',
      external: true,
    })
  }

  return {
    title: String(indexData.title || '相册'),
    description: indexData.description ? String(indexData.description) : (textContent ? md.render(textContent) : ''),
    photos,
  }
}

function generateAlbumModule(album: AlbumBuildData) {
  const imports: string[] = []
  const photos = album.photos.map((photo, index) => {
    const flags = [
      photo.external ? 'external: true' : '',
      typeof photo.size === 'number' ? `size: ${photo.size}` : '',
      typeof photo.mtime === 'number' ? `mtime: ${photo.mtime}` : '',
    ].filter(Boolean)
    const extra = flags.length ? `,\n      ${flags.join(',\n      ')}` : ''

    if (photo.external && photo.src) {
      return [
        '    {',
        `      src: ${JSON.stringify(photo.src)},`,
        `      title: ${JSON.stringify(photo.title)},`,
        `      description: ${JSON.stringify(photo.description)},`,
        `      filename: ${JSON.stringify(photo.filename)}${extra},`,
        '    },',
      ].join('\n')
    }

    const variable = `__arona_photo_${index}`
    imports.push(`import ${variable} from ${JSON.stringify(toAtFS(photo.filePath!))}`)
    return [
      '    {',
      `      src: ${variable},`,
      `      title: ${JSON.stringify(photo.title)},`,
      `      description: ${JSON.stringify(photo.description)},`,
      `      filename: ${JSON.stringify(photo.filename)}${extra},`,
      '    },',
    ].join('\n')
  })

  return [
    ...imports,
    'export default {',
    `  title: ${JSON.stringify(album.title)},`,
    `  description: ${JSON.stringify(album.description)},`,
    '  photos: [',
    ...photos,
    '  ],',
    '}',
  ].join('\n')
}

export function createAppsPlugin(options: ResolvedValaxyOptions<ThemeConfig>): Plugin {
  const userRoot = options.userRoot
  const notesDir = path.resolve(userRoot, 'pages', 'notes')
  const photosDir = path.resolve(userRoot, 'photos')

  return {
    name: 'valaxy-theme-arona:apps',
    resolveId(id) {
      if (id === NOTES_VIRTUAL_ID)
        return RESOLVED_NOTES_ID
      if (id === ALBUM_VIRTUAL_ID)
        return RESOLVED_ALBUM_ID
      if (id === FILES_VIRTUAL_ID)
        return RESOLVED_FILES_ID
    },
    async load(id) {
      if (id === RESOLVED_NOTES_ID) {
        const notes = await loadNotes(userRoot)
        return `export default ${JSON.stringify(notes)}`
      }
      if (id === RESOLVED_ALBUM_ID) {
        const album = await loadAlbum(userRoot)
        return generateAlbumModule(album)
      }
      if (id === RESOLVED_FILES_ID) {
        const files = await loadFiles(userRoot)
        return `export default ${JSON.stringify(files)}`
      }
    },
    configureServer(server) {
      for (const dir of [notesDir, photosDir]) {
        try {
          server.watcher.add(dir)
        }
        catch {
          // ignore missing dirs
        }
      }
    },
    handleHotUpdate(ctx) {
      if (!isInsideDir(ctx.file, notesDir) && !isInsideDir(ctx.file, photosDir))
        return

      for (const id of [RESOLVED_NOTES_ID, RESOLVED_ALBUM_ID]) {
        const mod = ctx.server.moduleGraph.getModuleById(id)
        if (mod)
          ctx.server.moduleGraph.invalidateModule(mod)
      }
    },
  }
}

function createRedirectHtml(target: string) {
  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8">',
    '<title>跳转中...</title>',
    `<meta http-equiv="refresh" content="0; url=${target}">`,
    `<link rel="canonical" href="${target}">`,
    `<script>location.replace('${target}')</script>`,
    '</head>',
    '<body>',
    `<p>正在跳转到 <a href="${target}">${target}</a>...</p>`,
    '</body>',
    '</html>',
  ].join('')
}

async function writeRedirectFile(dir: string, route: string, html: string) {
  await fs.writeFile(path.join(dir, `${route}.html`), html, 'utf-8')
  await fs.mkdir(path.join(dir, route), { recursive: true })
  await fs.writeFile(path.join(dir, route, 'index.html'), html, 'utf-8')
}

export async function writeAppRedirects(options: ResolvedValaxyOptions<ThemeConfig>) {
  const distDir = path.resolve(options.userRoot, 'dist')
  try {
    await fs.access(path.join(distDir, 'index.html'))
  }
  catch {
    return
  }

  const apps = resolveAppsConfig(options.config.themeConfig?.apps)
  const routes: Array<[string, string]> = [
    ['archives', 'archive'],
    ['tags', 'search'],
    ['about', 'about'],
  ]

  if (apps.files)
    routes.push(['categories', 'files'])
  if (apps.notes)
    routes.push(['notes', 'notes'])
  if (apps.album) {
    routes.push(['album', 'album'])
    routes.push(['photos', 'album'])
  }

  await Promise.all(routes.map(([route, app]) => {
    const target = `/?app=${app}`
    return writeRedirectFile(distDir, route, createRedirectHtml(target))
  }))
}
