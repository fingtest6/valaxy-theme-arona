<script lang="ts" setup>
import type { Post } from 'valaxy'
import { onMounted } from 'vue'

defineProps<{
  post: Post
}>()
onMounted(() => {
  // 延迟执行，确保 DOM 已渲染
  setTimeout(() => {
    const imgs = document.querySelectorAll('img[alt="random:h"]')
    imgs.forEach((element) => {
      const img = element as HTMLImageElement
      const randomNum = Math.floor(Math.random() * 48) + 1
      // 修复：移除 URL 中多余的空格
      img.src = `https://ra.rduteam.top/ri/h/${randomNum}.webp`
    })
  }, 100)
})
</script>

<template>
  <article class="gap-6 rounded-lg p-4 shadow-sm transition-all duration-300 xl:grid xl:grid-cols-5 hover:shadow-lg">
    <!-- 图片放在最左侧，占据2列 -->
    <div class="xl:col-span-2">
      <div class="aspect-video overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
        <img
          alt="random:h"
          class="h-full w-full object-cover"
          loading="lazy"
        >
      </div>
    </div>

    <!-- 内容区域占据剩余3列 -->
    <div class="flex flex-col xl:col-span-3 space-y-4">
      <div class="flex-grow space-y-3">
        <h2 class="text-2xl font-bold leading-8 tracking-tight">
          <RouterLink class="st-text transition-colors hover:text-blue-600" :to="post.path || ''">
            {{ post.title }}
          </RouterLink>
        </h2>
        <div
          v-if="post.excerpt"
          class="max-w-none text-gray-600 prose prose-sm dark:text-gray-300 dark:prose-invert"
          v-html="post.excerpt"
        />
      </div>
      <div class="pt-2">
        <RouterLink
          class="inline-flex items-center text-blue-600 font-medium transition-colors dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          aria-label="read more"
          :to="post.path || ''"
        >
          Read more
          <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
      </div>
      <!-- 日期与图片底部对齐 -->
      <div class="mt-auto flex justify-end pt-2">
        <StarterDate :date="post.date" />
      </div>
    </div>
  </article>
</template>
