<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useFrontmatter, usePostList } from 'valaxy'

const frontmatter = useFrontmatter()
const route = useRoute()
const posts = usePostList()

function findCurrentIndex() {
  return posts.value.findIndex(p => p.path === route.path)
}

const nextPost = computed(() => posts.value[findCurrentIndex() - 1])
const prevPost = computed(() => posts.value[findCurrentIndex() + 1])
</script>

<template>
  <!-- 全屏模糊背景层 -->
  <div
    class="pointer-events-none fixed inset-0 bg-gray-100/30 backdrop-blur-2xl transition-colors duration-300 -z-10 dark:bg-gray-900/50"
  />

  <!-- 主内容容器 -->
  <article
    class="relative mx-auto mt-12 max-w-4xl rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:bg-gray-800/90"
  >
    <!-- 文章头部 -->
    <header class="pt-6 text-center space-y-1 xl:pb-10">
      <StarterDate :date="frontmatter.date" class="text-gray-600 dark:text-gray-400" />
      <h1
        class="text-3xl text-gray-900 font-extrabold leading-9 tracking-tight md:text-5xl sm:text-4xl dark:text-gray-100 md:leading-14 sm:leading-10"
      >
        {{ frontmatter.title }}
      </h1>
    </header>

    <!-- 文章主体 -->
    <div class="pb-16 xl:grid xl:grid-cols-4 xl:gap-x-10 xl:pb-20">
      <!-- 作者信息 -->
      <StarterAuthor
        v-if="frontmatter.author" :frontmatter="frontmatter"
        class="dark:text-gray-300"
      />

      <!-- 主要内容区域 -->
      <div class="text-inherit prose xl:col-span-3 xl:row-span-2">
        <slot />
      </div>

      <!-- 文章导航页脚 -->
      <footer
        class="bg-transparent text-sm font-medium leading-5 xl:col-start-1 xl:row-start-2 xl:mt-10 space-y-6"
      >
        <!-- 下一篇 -->
        <div v-if="nextPost?.path" class="py-8">
          <h2
            class="text-xs text-gray-500 tracking-wide uppercase dark:text-gray-400"
          >
            下一篇文章
          </h2>
          <div class="link">
            <RouterLink
              class="text-gray-700 transition-colors dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              :to="nextPost.path"
            >
              {{ nextPost.title }}
            </RouterLink>
          </div>
        </div>

        <!-- 上一篇 -->
        <div v-if="prevPost?.path" class="py-8">
          <h2
            class="text-xs text-gray-500 tracking-wide uppercase dark:text-gray-400"
          >
            上一篇文章
          </h2>
          <div class="link">
            <RouterLink
              class="text-gray-700 transition-colors dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              :to="prevPost.path"
            >
              {{ prevPost.title }}
            </RouterLink>
          </div>
        </div>

        <!-- 返回链接 -->
        <div class="pt-8">
          <RouterLink
            class="text-gray-700 transition-colors dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            to="/allposts"
          >
            ← 返回文章列表
          </RouterLink>
        </div>
      </footer>
    </div>
  </article>
</template>

<style lang="postcss">
/* 强制继承方案 */
.prose {
  @apply text-gray-900 dark:text-gray-100;
}

.prose *:not(.gitalk-container):not(.gitalk-container *) {
  color: inherit !important;
}

/* 特殊元素颜色保持 */
.prose a {
  @apply text-gray-700 dark:text-gray-300;
}

.prose a:hover {
  @apply text-gray-900 dark:text-gray-100;
}

.prose pre {
  @apply bg-gray-100/60 dark:bg-gray-700/60
  border border-gray-200/60 dark:border-gray-600/60;
}

.dark .prose pre {
  @apply text-gray-100;
}

/* 代码块样式 */
.prose code {
  @apply text-gray-900 dark:text-gray-100
  bg-gray-100/60 dark:bg-gray-700/60;
}

/* 列表项 */
.prose li {
  @apply text-inherit;
}

/* 引用块 */
.prose blockquote {
  @apply border-gray-200/60 dark:border-gray-600/60
  text-gray-700 dark:text-gray-300;
}

/* 表格 */
.prose table {
  @apply border border-gray-200/60 dark:border-gray-600/60;
}

.prose th {
  @apply bg-gray-100/60 dark:bg-gray-700/60;
}
</style>
