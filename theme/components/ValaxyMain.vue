<script setup lang="ts">
import type { PageData, Post } from 'valaxy'
import { formatDate } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  frontmatter: Post
  data?: PageData
}>()

const title = computed(() => {
  const t = props.frontmatter?.title
  if (!t)
    return ''
  if (typeof t === 'string')
    return t
  if (typeof t === 'object') {
    const o = t as Record<string, string>
    return o.zh || o['zh-CN'] || o.en || o.default || Object.values(o)[0] || ''
  }
  return String(t)
})

const dateText = computed(() => {
  const d = props.frontmatter?.date
  if (!d)
    return ''
  return formatDate(d)
})

const author = computed(() => props.frontmatter?.author || '')
</script>

<template>
  <article class="article-view">
    <header class="article-view__header">
      <h1 class="article-view__title">
        {{ title }}
      </h1>
      <div v-if="dateText || author" class="article-view__meta">
        <span v-if="author" class="article-view__author">{{ author }}</span>
        <time v-if="dateText" class="article-view__date">{{ dateText }}</time>
      </div>
    </header>

    <div class="article-view__content">
      <ValaxyMd :frontmatter="frontmatter">
        <slot name="main-content-md" />
        <slot />
      </ValaxyMd>
    </div>
  </article>
</template>

<style scoped>
.article-view {
  font-size: 16px;
  line-height: 1.75;
  color: var(--va-c-text, #333);
}

.article-view__header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

html.dark .article-view__header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.article-view__title {
  margin: 0 0 12px;
  font-size: 28px;
  line-height: 1.3;
  font-weight: 800;
  color: var(--va-c-text, #1d1d1f);
  letter-spacing: -0.02em;
}

.article-view__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
}

html.dark .article-view__meta {
  color: rgba(255, 255, 255, 0.55);
}

.article-view__author {
  font-weight: 600;
}
</style>
