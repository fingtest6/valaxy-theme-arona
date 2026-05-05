<script lang="ts" setup>
import type { Post } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  post: Post
}>()

// 🔹 常量配置（避免魔法数字）
const RANDOM_COVER_MAX = 48
const EXCERPT_MAX_LENGTH = 150
const DEFAULT_COVER = '/default-cover.webp'

// 🔹 获取 tags（兼容多种数据源）
const tags = computed(() => {
  const t = props.post.frontmatter?.tags || props.post.tags
  if (!t)
    return []
  return Array.isArray(t) ? t : [t]
})

// 🔹 生成稳定的随机封面（基于文章路径哈希，避免重新渲染时闪烁）
const coverUrl = computed(() => {
  // 使用 post 路径生成稳定哈希，确保同一篇文章封面固定
  const seed = props.post.path
    ? props.post.path.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : Math.random() * 1000

  const randomNum = (seed % RANDOM_COVER_MAX) + 1
  // ✅ 修复：移除 URL 中多余空格
  return `https://ra.rduteam.top/ri/h/${randomNum}.webp`
})

// 🔹 安全获取文章标题（统一处理多语言/对象类型）
const postTitle = computed(() => {
  const { title } = props.post
  if (typeof title === 'string')
    return title.trim() || 'Untitled'
  if (title && typeof title === 'object') {
    const t = title as Record<string, string>
    return t.zh || t.en || t.default || Object.values(t)[0] || 'Untitled'
  }
  return 'Untitled'
})

// 🔹 提取纯文本摘要（避免重复计算）
const plainTextContent = computed(() => {
  return props.post.content?.replace(/<[^>]*>/g, '').trim() || ''
})

const excerptPreview = computed(() => {
  if (props.post.excerpt)
    return props.post.excerpt
  if (!plainTextContent.value)
    return ''

  const text = plainTextContent.value
  return text.length > EXCERPT_MAX_LENGTH
    ? `${text.substring(0, EXCERPT_MAX_LENGTH)}...`
    : text
})

// 🔹 图片加载失败 fallback
function handleImageError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.src !== DEFAULT_COVER) {
    img.src = DEFAULT_COVER
  }
}
</script>

<template>
  <article
    class="gap-6 rounded-lg p-4 shadow-sm transition-all duration-300 xl:grid xl:grid-cols-5 hover:shadow-lg"
    :aria-labelledby="`post-title-${post.slug || post.path}`"
  >
    <!-- 🔹 图片区域 -->
    <div class="xl:col-span-2">
      <div class="aspect-video overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
        <img
          :src="coverUrl"
          :alt="`Cover image for ${postTitle}`"
          class="h-full w-full object-cover"
          loading="lazy"
          @error="handleImageError"
        >
      </div>
    </div>

    <!-- 🔹 内容区域 -->
    <div class="flex flex-col xl:col-span-3 space-y-4">
      <div class="flex-grow space-y-3">
        <!-- 📌 标题（使用计算属性确保类型安全） -->
        <h2
          :id="`post-title-${post.slug || post.path}`"
          class="text-2xl font-bold leading-8 tracking-tight"
        >
          <RouterLink
            class="st-text transition-colors hover:text-blue-600"
            :to="post.path || ''"
          >
            {{ postTitle }}
          </RouterLink>
        </h2>

        <!-- 🏷️ Tags 标签 -->
        <div v-if="tags.length" class="flex flex-wrap gap-2" role="list">
          <span
            v-for="tag in tags"
            :key="tag"
            class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            role="listitem"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- 📝 摘要预览（使用计算属性，避免模板内复杂逻辑） -->
        <div
          v-if="excerptPreview"
          class="prose-sm max-w-none text-gray-600 prose dark:text-gray-300 dark:prose-invert"
          v-html="post.excerpt || excerptPreview"
        />
      </div>
      <div class="pt-2">
        <RouterLink
          class="inline-flex items-center text-blue-600 font-medium transition-colors dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          :to="post.path || ''"
          :aria-label="`Read more about ${postTitle}`"
        >
          Read more
          <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
      </div>
      <div class="mt-auto flex justify-end pt-2">
        <StarterDate :date="post.date" />
      </div>
    </div>
  </article>
</template>
