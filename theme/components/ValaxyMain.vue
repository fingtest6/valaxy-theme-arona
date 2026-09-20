<script setup lang="ts">
import type { PageData, Post } from 'valaxy'
import { formatDate } from 'valaxy'
import { computed } from 'vue'
import { resolveTitle } from '../composables/desktop'

const props = defineProps<{
  frontmatter: Post
  data?: PageData
}>()

// 复用共享的标题解析；空标题保持空串（resolveTitle 自身会回退到「未命名」）
const title = computed(() =>
  props.frontmatter?.title ? resolveTitle(props.frontmatter.title) : '',
)

const dateText = computed(() => {
  const d = props.frontmatter?.date
  if (!d)
    return ''
  return formatDate(d)
})

const author = computed(() => props.frontmatter?.author || '')

const tags = computed(() =>
  Array.isArray(props.frontmatter?.tags) ? props.frontmatter.tags : [],
)
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
      <div v-if="tags.length" class="article-view__tags">
        <span v-for="tag in tags" :key="tag" class="article-view__tag">#{{ tag }}</span>
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
  color: var(--va-c-text);
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

.article-view__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.article-view__tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--st-accent);
  background: color-mix(in srgb, var(--st-accent) 12%, transparent);
}

html.dark .article-view__tag {
  background: color-mix(in srgb, var(--st-accent) 18%, transparent);
}
</style>
