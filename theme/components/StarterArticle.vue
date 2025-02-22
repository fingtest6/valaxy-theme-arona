<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
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
  <div class="pointer-events-none fixed inset-0 bg-gray-100/30 backdrop-blur-2xl -z-10 dark:bg-gray-900/50" />

  <!-- 主内容容器 -->
  <article
    class="relative mx-auto max-w-4xl rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:bg-gray-800/90"
  >
    <!-- 文章头部 -->
    <header class="pt-6 text-center space-y-1 xl:pb-10">
      <StarterDate
        :date="frontmatter.date"
        class="text-gray-600 dark:text-gray-400"
      />
      <h1 class="text-3xl text-gray-900 font-extrabold leading-9 tracking-tight md:text-5xl sm:text-4xl dark:text-gray-100 md:leading-14 sm:leading-10">
        {{ frontmatter.title }}
      </h1>
    </header>

    <!-- 文章主体 -->
    <div class="pb-16 xl:grid xl:grid-cols-4 xl:gap-x-10 divide-y divide-gray-200 xl:pb-20 xl:divide-y-0 dark:divide-gray-600">
      <!-- 作者信息 -->
      <StarterAuthor
        v-if="frontmatter.author"
        :frontmatter="frontmatter"
        class="dark:text-gray-300"
      />

      <!-- 主要内容区域 -->
      <div class="prose xl:col-span-3 xl:row-span-2 divide-y divide-gray-200 xl:pb-0 dark:prose-invert dark:divide-gray-600">
        <slot />
      </div>

      <!-- 文章导航页脚 -->
      <footer class="bg-transparent text-sm font-medium leading-5 xl:col-start-1 xl:row-start-2 divide-y divide-gray-200 dark:divide-gray-600">
        <!-- 下一篇 -->
        <div v-if="nextPost && nextPost.path" class="py-8">
          <h2 class="text-xs text-gray-500 tracking-wide uppercase dark:text-gray-400">
            Next Article
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
        <div v-if="prevPost && prevPost.path" class="py-8">
          <h2 class="text-xs text-gray-500 tracking-wide uppercase dark:text-gray-400">
            Previous Article
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

<style>
/* 深度自定义深色模式样式 */
.dark .prose {
  --tw-prose-body: theme('colors.gray.200');
  --tw-prose-headings: theme('colors.gray.100');
  --tw-prose-links: theme('colors.blue.300');
  --tw-prose-bold: theme('colors.gray.100');
  --tw-prose-code: theme('colors.gray.100');
}

.dark .prose pre {
  @apply bg-gray-700/60 backdrop-blur-lg;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* 强制所有文字继承容器颜色 */
.prose,
.prose * {
  color: inherit !important;
}
</style>
