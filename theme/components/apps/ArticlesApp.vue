<script setup lang="ts">
import type { Post } from 'valaxy'
import { usePostList } from 'valaxy'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDesktop } from '../../composables/desktop'
import ArticleList from './ArticleList.vue'

const desktop = useDesktop()
const router = useRouter()
const posts = usePostList()

const postCount = computed(() => posts.value.length)

function openPost(post: Post) {
  desktop.openArticle(post)
  router.push(post.path || '/')
}
</script>

<template>
  <div class="articles-app">
    <ArticleList @open="openPost" />
    <div class="articles-app__status">
      {{ postCount }} 篇文章
    </div>
  </div>
</template>

<style scoped>
.articles-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.55);
}

html.dark .articles-app {
  background: rgba(24, 24, 28, 0.4);
}

.articles-app__status {
  padding: 8px 16px;
  text-align: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  flex-shrink: 0;
}

html.dark .articles-app__status {
  color: rgba(255, 255, 255, 0.4);
  border-top-color: rgba(255, 255, 255, 0.07);
}
</style>
