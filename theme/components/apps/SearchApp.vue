<script setup lang="ts">
import type { FuseListItem } from 'valaxy'
import { useFuseSearch } from 'valaxy'
import type { Ref } from 'vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDesktop } from '../../composables/desktop'

interface SearchResultItem {
  item: FuseListItem & { content?: string; date?: string }
  matches?: unknown[]
  score?: number
}

const desktop = useDesktop()
const router = useRouter()
const keyword = ref('')
const inputRef = ref<HTMLInputElement>()
const loading = ref(false)

const search = useFuseSearch(() => keyword.value) as unknown as {
  results: Readonly<Ref<SearchResultItem[]>>
  fetchFuseListData: (path?: string) => Promise<void>
}
const results = computed<SearchResultItem[]>(() => search.results.value || [])
const resultCount = computed(() => results.value.length)

onMounted(async () => {
  await nextTick()
  inputRef.value?.focus()
  loading.value = true
  try {
    await search.fetchFuseListData()
  }
  catch {
    // 索引加载失败时静默
  }
  finally {
    loading.value = false
  }
})

function openLink(link: string) {
  if (!link)
    return
  desktop.openArticle({ path: link } as any)
  router.push(link)
}

function formatDate(d: string | number | Date | undefined) {
  if (!d)
    return ''
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function plainText(text: unknown): string {
  return String(text || '').replace(/<[^>]*>/g, '').trim()
}

/**
 * 从文章全文里截取关键词附近的片段
 */
function contentSnippet(item: any): string {
  const kw = keyword.value.trim()
  if (!kw || !item.content)
    return ''
  const text = String(item.content)
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*`>\[\]!()|_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const idx = text.toLowerCase().indexOf(kw.toLowerCase())
  if (idx === -1)
    return ''
  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, idx + kw.length + 60)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

function highlight(text: string): string {
  const kw = keyword.value.trim()
  if (!kw)
    return text
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}
</script>

<template>
  <div class="search-app">
    <div class="search-app__toolbar">
      <div class="search-app__input-wrap">
        <i i-ri-search-line />
        <input
          ref="inputRef"
          v-model="keyword"
          type="text"
          placeholder="搜索文章标题、正文、标签…"
        >
        <button v-if="keyword" class="search-app__clear" title="清空" @click="keyword = ''">
          <i i-ri-close-line />
        </button>
      </div>
      <span v-if="keyword" class="search-app__count">{{ resultCount }} 条结果</span>
    </div>

    <div class="search-app__results">
      <button
        v-for="r in results"
        :key="r.item.link"
        class="search-result"
        @click="openLink(r.item.link)"
      >
        <h3 class="search-result__title" v-html="highlight(String(r.item.title || ''))" />
        <p v-if="keyword && contentSnippet(r.item)" class="search-result__snippet" v-html="highlight(contentSnippet(r.item))" />
        <p v-else-if="r.item.excerpt" class="search-result__excerpt">{{ plainText(r.item.excerpt) }}</p>
        <div class="search-result__meta">
          <time v-if="r.item.date">{{ formatDate(r.item.date) }}</time>
          <span v-if="Array.isArray(r.item.tags) && r.item.tags.length" class="search-result__tags">
            {{ r.item.tags.slice(0, 3).map(t => `#${t}`).join(' ') }}
          </span>
        </div>
      </button>

      <div v-if="!keyword" class="search-app__empty">
        <i i-ri-search-line />
        <p>输入关键词开始搜索</p>
      </div>
      <div v-else-if="loading" class="search-app__empty">
        <i i-ri-loader-4-line class="search-app__spinner" />
        <p>正在加载索引…</p>
      </div>
      <div v-else-if="!resultCount" class="search-app__empty">
        <i i-ri-file-search-line />
        <p>没有找到相关文章</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.55);
}

html.dark .search-app {
  background: rgba(24, 24, 28, 0.4);
}

.search-app__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  flex-shrink: 0;
}

html.dark .search-app__toolbar {
  border-bottom-color: rgba(255, 255, 255, 0.07);
}

.search-app__input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.5);
  transition: box-shadow 0.15s ease;
}

.search-app__input-wrap:focus-within {
  box-shadow: 0 0 0 2px var(--st-accent, #0078e7);
}

html.dark .search-app__input-wrap {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

.search-app__input-wrap i {
  font-size: 18px;
}

.search-app__input-wrap input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--va-c-text, #333);
}

.search-app__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

html.dark .search-app__clear {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.5);
}

.search-app__count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
}

html.dark .search-app__count {
  color: rgba(255, 255, 255, 0.45);
}

.search-app__results {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
}

.search-result {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
}

.search-result:hover {
  background: rgba(0, 0, 0, 0.05);
}

html.dark .search-result:hover {
  background: rgba(255, 255, 255, 0.08);
}

.search-result__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--va-c-text, #1d1d1f);
}

.search-result__snippet {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.55);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-result__excerpt {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.55);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

html.dark .search-result__snippet,
html.dark .search-result__excerpt {
  color: rgba(255, 255, 255, 0.55);
}

.search-result__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}

html.dark .search-result__meta {
  color: rgba(255, 255, 255, 0.4);
}

.search-result__tags {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-app__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 70px 0;
  color: rgba(0, 0, 0, 0.35);
}

html.dark .search-app__empty {
  color: rgba(255, 255, 255, 0.35);
}

.search-app__empty i {
  font-size: 44px;
}

.search-app__empty p {
  margin: 0;
  font-size: 14px;
}

.search-app__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
