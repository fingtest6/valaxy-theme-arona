<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from 'valaxy'
import { usePostList } from 'valaxy'
import { useDark } from '@vueuse/core'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const isDark = useDark()
const routes = usePostList({ type: props.type || '' })
const posts = computed(() => props.posts || routes.value)
</script>

<template>
  <!-- 全屏模糊背景层 -->
  <div
    class="pointer-events-none fixed inset-0 bg-gray-100/30 backdrop-blur-2xl transition-colors duration-300 -z-10 dark:bg-gray-900/50"
  />

  <!-- 文章列表容器 -->
  <ul
    class="relative mx-auto mt-12 max-w-4xl rounded-2xl p-8 shadow-2xl backdrop-blur-xl transition-all duration-300" :class="[
      isDark ? 'bg-gray-800/90 text-gray-200' : 'bg-white/80 text-gray-900',
    ]"
  >
    <!-- 文章卡片循环 -->
    <template v-for="post in posts" :key="post.path">
      <Transition name="fade">
        <li
          v-if="post" class="border-b border-gray-200/60 py-12 transition-colors duration-300 last:border-b-0 dark:border-gray-700/60"
        >
          <!-- 强制传递主题类 -->
          <StarterArticleCard
            :post="post"
            class="w-full transition-colors duration-300 dark:text-gray-200" :class="[
              isDark ? 'text-gray-200' : 'text-gray-900',
            ]"
          />
        </li>
      </Transition>
    </template>
  </ul>
</template>

<style lang="postcss">
/* 强制全局继承 */
.dark {
  @apply text-gray-200;
}

/* 深度覆盖子组件样式 */
:deep(.article-card) {
  @apply text-inherit;

  h2 {
    @apply text-gray-900 dark:text-gray-100;
  }

  p {
    @apply text-gray-700 dark:text-gray-300;
  }

  a {
    @apply text-blue-600 dark:text-blue-400;
  }
}

/* 列表项悬停效果 */
ul li:hover {
  @apply bg-white/60 dark:bg-gray-700/60;
  @apply backdrop-blur-lg;
  transition: all 0.3s ease;
}

/* 特殊元素样式 */
ul a {
  @apply text-gray-700 dark:text-gray-300;
}

ul a:hover {
  @apply text-gray-900 dark:text-gray-100;
}

/* 代码块样式 */
ul pre {
  @apply bg-gray-100/60 dark:bg-gray-700/60
  border border-gray-200/60 dark:border-gray-600/60;
}

ul code {
  @apply text-gray-900 dark:text-gray-100
  bg-gray-100/60 dark:bg-gray-700/60;
}

/* 引用块样式 */
ul blockquote {
  @apply border-l-4 border-gray-200/60 dark:border-gray-600/60
  text-gray-700 dark:text-gray-300;
}

/* 列表嵌套 */
ul ul,
ul ol {
  @apply pl-6 my-4;
}

/* 加载过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
