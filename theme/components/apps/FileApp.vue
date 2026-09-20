<script setup lang="ts">
import albumData from 'virtual:arona/album'
import filesData from 'virtual:arona/files'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { selectAlbumPhoto, selectNote } from '../../composables/apps'
import { useThemeConfig } from '../../composables/config'
import { useDesktop } from '../../composables/desktop'
import { readStorage, STORAGE_KEYS, writeStorage } from '../../shared/storage'
import { formatDateTime, formatSize } from '../../utils/format'

type FolderKey = 'posts' | 'notes' | 'photos'
type FileType = 'markdown' | 'image'

interface FileItem {
  key: string
  folder: FolderKey
  relativePath: string
  name: string
  type: FileType
  size?: number
  mtime?: number
  routePath?: string
  slug?: string
  src?: string
  external?: boolean
}

interface TreeNode {
  name: string
  folders: Map<string, TreeNode>
  files: FileItem[]
}

const desktop = useDesktop()
const router = useRouter()
const themeConfig = useThemeConfig()
const files = filesData
const album = albumData

const currentPath = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

function createNode(name = ''): TreeNode {
  return { name, folders: new Map(), files: [] }
}

const allItems = computed<FileItem[]>(() => {
  const items: FileItem[] = []

  for (const entry of [...files.posts, ...files.notes]) {
    items.push({
      key: `${entry.folder}/${entry.relativePath}`,
      folder: entry.folder,
      relativePath: entry.relativePath,
      name: entry.name,
      type: 'markdown',
      size: entry.size,
      mtime: entry.mtime,
      routePath: entry.routePath,
      slug: entry.slug,
    })
  }

  const photoMap = new Map<string, FileItem>()
  for (const photo of album.photos) {
    if (photoMap.has(photo.src))
      continue
    photoMap.set(photo.src, {
      key: `photos/${photo.src}`,
      folder: 'photos',
      relativePath: photo.filename,
      name: photo.filename,
      type: 'image',
      size: photo.size,
      mtime: photo.mtime,
      src: photo.src,
      external: photo.external,
    })
  }
  items.push(...photoMap.values())

  return items
})

const tree = computed(() => {
  const root = createNode()

  for (const key of ['posts', 'photos', 'notes'])
    root.folders.set(key, createNode(key))

  for (const item of allItems.value) {
    const segments = [item.folder, ...item.relativePath.split('/').filter(Boolean)]
    let node = root
    for (const segment of segments.slice(0, -1)) {
      if (!node.folders.has(segment))
        node.folders.set(segment, createNode(segment))
      node = node.folders.get(segment)!
    }
    node.files.push(item)
  }

  return root
})

const breadcrumbs = computed(() => currentPath.value.split('/').filter(Boolean))

const currentNode = computed(() => {
  let node = tree.value
  for (const segment of breadcrumbs.value) {
    const next = node.folders.get(segment)
    if (!next)
      return node
    node = next
  }
  return node
})

const folderOrder: Record<string, number> = { posts: 0, photos: 1, notes: 2 }

const folders = computed(() =>
  Array.from(currentNode.value.folders.values())
    .sort((a, b) => (folderOrder[a.name] ?? 99) - (folderOrder[b.name] ?? 99) || a.name.localeCompare(b.name, 'zh-CN')),
)

const filesInFolder = computed(() =>
  [...currentNode.value.files]
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true })),
)

function countFiles(node: TreeNode): number {
  let total = node.files.length
  for (const child of node.folders.values())
    total += countFiles(child)
  return total
}

const totalCount = computed(() => countFiles(currentNode.value))

function enterFolder(name: string) {
  currentPath.value = currentPath.value ? `${currentPath.value}/${name}` : name
}

function goRoot() {
  currentPath.value = ''
}

function goTo(index: number) {
  currentPath.value = breadcrumbs.value.slice(0, index + 1).join('/')
}

function typeLabel(file: FileItem) {
  if (file.type === 'image')
    return file.external ? '网络图片' : '图片'
  return 'Markdown'
}

function iconFor(file: FileItem) {
  if (file.external)
    return 'i-ri-external-link-line'
  if (file.type === 'image')
    return 'i-ri-image-line'
  return 'i-ri-markdown-line'
}

function openItem(file: FileItem) {
  if (file.type === 'image') {
    if (file.external && file.src) {
      window.open(file.src, '_blank', 'noopener,noreferrer')
      return
    }
    if (file.src)
      selectAlbumPhoto(file.name)
    if (themeConfig.value.apps?.album !== false)
      desktop.openApp('album')
    else if (file.src)
      window.open(file.src, '_blank', 'noopener,noreferrer')
    return
  }

  if (file.folder === 'posts' && file.routePath) {
    desktop.openArticle({ path: file.routePath, title: file.name })
    router.push(file.routePath)
    return
  }

  if (file.folder === 'notes' && file.slug) {
    if (themeConfig.value.apps?.notes !== false) {
      selectNote(file.slug)
      desktop.openApp('notes')
    }
    else if (file.slug !== 'index') {
      router.push(`/notes/${file.slug}`)
    }
  }
}

onMounted(() => {
  const saved = readStorage(STORAGE_KEYS.fileView)
  if (saved === 'grid' || saved === 'list')
    viewMode.value = saved
})

watch(viewMode, (mode) => {
  writeStorage(STORAGE_KEYS.fileView, mode)
})
</script>

<template>
  <div class="file-app">
    <header class="file-app__toolbar">
      <button
        class="file-app__tool"
        :disabled="!breadcrumbs.length"
        title="返回文件根目录"
        @click="goRoot"
      >
        <i i-ri-home-line />
      </button>

      <div class="file-app__breadcrumb">
        <button
          class="file-app__crumb"
          :class="{ 'is-current': !breadcrumbs.length }"
          @click="goRoot"
        >
          文件
        </button>
        <template v-for="(crumb, i) in breadcrumbs" :key="`${crumb}-${i}`">
          <i i-ri-arrow-right-s-line class="file-app__sep" />
          <button
            class="file-app__crumb"
            :class="{ 'is-current': i === breadcrumbs.length - 1 }"
            @click="goTo(i)"
          >
            {{ crumb }}
          </button>
        </template>
      </div>

      <div class="file-app__view-switch">
        <button
          class="file-app__view-btn"
          :class="{ 'is-active': viewMode === 'grid' }"
          title="网格视图"
          @click="viewMode = 'grid'"
        >
          <i i-ri-layout-grid-line />
        </button>
        <button
          class="file-app__view-btn"
          :class="{ 'is-active': viewMode === 'list' }"
          title="详细信息"
          @click="viewMode = 'list'"
        >
          <i i-ri-list-check-2 />
        </button>
      </div>

      <span class="file-app__count">{{ totalCount }} 个文件</span>
    </header>

    <div class="file-app__body">
      <div v-if="viewMode === 'grid'" class="file-app__grid">
        <button
          v-for="folder in folders"
          :key="`folder-${folder.name}`"
          class="file-card is-folder"
          @click="enterFolder(folder.name)"
        >
          <span class="file-card__thumb">
            <i i-ri-folder-2-line />
          </span>
          <div class="file-card__info">
            <span class="file-card__name">{{ folder.name }}</span>
            <span class="file-card__meta">{{ countFiles(folder) }} 个文件</span>
          </div>
        </button>

        <button
          v-for="file in filesInFolder"
          :key="file.key"
          class="file-card"
          :class="{ 'is-image': file.type === 'image' }"
          @click="openItem(file)"
        >
          <span class="file-card__thumb">
            <img v-if="file.type === 'image'" :src="file.src" :alt="file.name" loading="lazy">
            <i v-else :class="iconFor(file)" />
            <span v-if="file.external" class="file-card__shortcut">
              <i i-ri-external-link-line />
            </span>
          </span>
          <div class="file-card__info">
            <span class="file-card__name">{{ file.name }}</span>
            <span class="file-card__meta">
              {{ typeLabel(file) }}<template v-if="file.size"> · {{ formatSize(file.size) }}</template>
            </span>
          </div>
        </button>
      </div>

      <div v-else class="file-app__list">
        <div
          v-for="folder in folders"
          :key="`folder-${folder.name}`"
          class="file-row is-folder"
          @click="enterFolder(folder.name)"
        >
          <span class="file-row__name">
            <i i-ri-folder-2-line />
            <span class="file-row__filename">{{ folder.name }}</span>
          </span>
          <span class="file-row__type">文件夹</span>
          <span class="file-row__size">-</span>
          <span class="file-row__time">-</span>
        </div>

        <div
          v-for="file in filesInFolder"
          :key="file.key"
          class="file-row"
          @click="openItem(file)"
        >
          <span class="file-row__name">
            <img
              v-if="file.type === 'image' && !file.external"
              :src="file.src"
              class="file-row__thumb"
              :alt="file.name"
              loading="lazy"
            >
            <i v-else :class="iconFor(file)" />
            <span class="file-row__filename">{{ file.name }}</span>
            <span v-if="file.external" class="file-row__shortcut">
              <i i-ri-external-link-line />
            </span>
          </span>
          <span class="file-row__type">{{ typeLabel(file) }}</span>
          <span class="file-row__size">{{ file.size ? formatSize(file.size) : '-' }}</span>
          <span class="file-row__time">{{ file.mtime ? formatDateTime(file.mtime) : '-' }}</span>
        </div>

        <div v-if="!folders.length && !filesInFolder.length" class="file-row file-row--empty">
          这个文件夹是空的
        </div>
      </div>

      <div
        v-if="viewMode === 'grid' && !folders.length && !filesInFolder.length"
        class="file-app__empty"
      >
        <i i-ri-folder-open-line />
        <p>这个文件夹是空的</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--st-app-bg);
  color: var(--va-c-text);
}

html.dark .file-app {
  background: var(--st-app-bg-dark);
}

.file-app__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

html.dark .file-app__toolbar {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.file-app__tool {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: none;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.06);
  color: inherit;
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
}

.file-app__tool:disabled {
  opacity: 0.35;
  cursor: default;
}

.file-app__tool:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.12);
}

html.dark .file-app__tool {
  background: rgba(255, 255, 255, 0.08);
}

html.dark .file-app__tool:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.16);
}

.file-app__breadcrumb {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
}

.file-app__crumb {
  max-width: 120px;
  padding: 5px 7px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(0, 0, 0, 0.62);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.file-app__crumb:hover {
  background: rgba(0, 0, 0, 0.06);
}

.file-app__crumb.is-current {
  color: var(--st-accent);
  font-weight: 700;
}

html.dark .file-app__crumb {
  color: rgba(255, 255, 255, 0.68);
}

html.dark .file-app__crumb:hover {
  background: rgba(255, 255, 255, 0.1);
}

.file-app__sep {
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.28);
}

html.dark .file-app__sep {
  color: rgba(255, 255, 255, 0.32);
}

.file-app__view-switch {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
  padding: 2px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
}

html.dark .file-app__view-switch {
  background: rgba(255, 255, 255, 0.08);
}

.file-app__view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.55;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
}

.file-app__view-btn:hover {
  opacity: 1;
}

.file-app__view-btn.is-active {
  background: rgba(255, 255, 255, 0.8);
  opacity: 1;
}

html.dark .file-app__view-btn.is-active {
  background: rgba(255, 255, 255, 0.16);
}

.file-app__count {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.42);
}

html.dark .file-app__count {
  color: rgba(255, 255, 255, 0.42);
}

.file-app__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px;
}

.file-app__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.52);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.file-card:hover {
  background: rgba(255, 255, 255, 0.72);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.09);
}

html.dark .file-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.07);
}

html.dark .file-card:hover {
  background: rgba(255, 255, 255, 0.12);
}

.file-card__thumb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 9px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 24px;
  color: var(--st-accent);
}

html.dark .file-card__thumb {
  background: rgba(255, 255, 255, 0.08);
}

.file-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-card.is-folder .file-card__thumb {
  color: #f5a623;
}

.file-card__shortcut,
.file-row__shortcut {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  border-radius: 5px;
  background: var(--st-accent);
  color: #fff;
  font-size: 10px;
}

.file-card__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.file-card__name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-card__meta {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.42);
}

html.dark .file-card__meta {
  color: rgba(255, 255, 255, 0.42);
}

.file-app__list {
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.35);
}

html.dark .file-app__list {
  border-color: rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.04);
}

.file-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 80px 90px 140px;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.15s ease;
}

.file-row:last-child {
  border-bottom: none;
}

.file-row:hover {
  background: rgba(0, 0, 0, 0.05);
}

html.dark .file-row {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

html.dark .file-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.file-row__name {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-weight: 600;
}

.file-row__name i {
  flex-shrink: 0;
  color: var(--st-accent);
}

.file-row.is-folder .file-row__name i {
  color: #f5a623;
}

.file-row__thumb {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 5px;
}

.file-row__filename {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-row__shortcut {
  position: static;
  display: inline-flex;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  font-size: 9px;
}

.file-row__type,
.file-row__size,
.file-row__time {
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

html.dark .file-row__type,
html.dark .file-row__size,
html.dark .file-row__time {
  color: rgba(255, 255, 255, 0.45);
}

.file-row--empty {
  display: block;
  color: rgba(0, 0, 0, 0.4);
  cursor: default;
  text-align: center;
}

html.dark .file-row--empty {
  color: rgba(255, 255, 255, 0.4);
}

.file-app__empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 200px;
  color: rgba(0, 0, 0, 0.4);
}

.file-app__empty i {
  font-size: 42px;
}

.file-app__empty p {
  margin: 0;
  font-size: 13px;
}

html.dark .file-app__empty {
  color: rgba(255, 255, 255, 0.4);
}
</style>
