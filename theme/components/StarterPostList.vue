<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from 'valaxy'
import { usePostList } from 'valaxy'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const routes = usePostList({ type: props.type || '' })
const posts = computed(() => props.posts || routes.value)
</script>

<template>
  <div class="pointer-events-none fixed inset-0 bg-gray-100/30 backdrop-blur-2xl -z-10 dark:bg-gray-900/50" />
  <ul
    class="relative mx-auto mt-12 max-w-4xl rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:bg-gray-800/90"
  >
    <template v-for="post in posts" :key="post.path">
      <Transition name="fade">
        <li v-if="post" class="py-12">
          <StarterArticleCard :post="post" />
        </li>
      </Transition>
    </template>
  </ul>
</template>
