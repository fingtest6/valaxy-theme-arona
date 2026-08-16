<script setup lang="ts">
import type { Post } from 'valaxy'
import { usePostList } from 'valaxy'
import { computed, ref } from 'vue'
import { resolveTitle } from '../../composables/desktop'

const emit = defineEmits<{
  (e: 'open', post: Post): void
}>()

const posts = usePostList()
const keyword = ref('')

const filteredPosts = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw)
    return posts.value
  return posts.value.filter((p) => {
    const title = String(resolveTitle(p.title)).toLowerCase()
    const excerpt = String(p.excerpt || '').toLowerCase()
    const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : ''
    return title.includes(kw) || excerpt.includes(kw) || tags.includes(kw)
  })
})

function formatDate(d: Post['date']) {
  if (!d)
    return ''
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="article-list">
    <div class="article-list__search">
      <i i-ri-search-line />
      <input v-model="keyword" type="text" placeholder="搜索文章…">
    </div>

    <div class="article-list__scroll">
      <button
        v-for="post in filteredPosts"
        :key="post.path"
        class="article-list__item"
        @click="emit('open', post)"
      >
        <span class="article-list__title">{{ resolveTitle(post.title) }}</span>
        <span v-if="post.excerpt" class="article-list__excerpt">{{ String(post.excerpt).replace(/<[^>]*>/g, '').trim() }}</span>
        <span class="article-list__meta">
          <time v-if="post.date">{{ formatDate(post.date) }}</time>
          <span v-if="Array.isArray(post.tags) && post.tags.length" class="article-list__tags">
            {{ post.tags.slice(0, 3).map(t => `#${t}`).join(' ') }}
          </span>
        </span>
      </button>

      <div v-if="!filteredPosts.length" class="article-list__empty">
        <i i-ri-file-list-3-line />
        <p>没有找到文章</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-list {
  flex: 1 1 0%;
  min-height: 0;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.article-list__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 12px 14px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

html.dark .article-list__search {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

.article-list__search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--va-c-text, #333);
}

.article-list__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
  min-height: 0;
}

.article-list__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
}

.article-list__item:hover {
  background: rgba(0, 0, 0, 0.05);
}

html.dark .article-list__item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.article-list__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-c-text, #1d1d1f);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-list__excerpt {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.dark .article-list__excerpt {
  color: rgba(255, 255, 255, 0.5);
}

.article-list__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}

html.dark .article-list__meta {
  color: rgba(255, 255, 255, 0.4);
}

.article-list__tags {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: rgba(0, 0, 0, 0.35);
}

.article-list__empty i {
  font-size: 36px;
}
</style>
