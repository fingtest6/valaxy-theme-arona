<script setup lang="ts">
import type { Post } from 'valaxy'
import { useRouter } from 'vue-router'
import ArticleList from './ArticleList.vue'

const props = defineProps<{
  /**
   * 当前文章的编译后组件（由 Desktop 通过路由解析）
   */
  component?: any
  /**
   * 当前文章路径，为空表示未选择文章
   */
  currentPath?: string
}>()

const router = useRouter()

function openPost(post: Post) {
  router.push(post.path || '/')
}
</script>

<template>
  <div class="reader">
    <!-- 左：文章列表 -->
    <aside class="reader__list">
      <ArticleList @open="openPost" />
    </aside>

    <!-- 中：文章内容 -->
    <section class="reader__content">
      <div v-if="component" class="reader__content-scroll">
        <component :is="component" />
      </div>
      <div v-else class="reader__welcome">
        <div class="reader__welcome-icon">
          <i i-ri-file-text-line />
        </div>
        <h2>欢迎阅读</h2>
        <p>在左侧列表选择一篇文章开始阅读</p>
      </div>
    </section>

    <!-- 右：评论 -->
    <aside v-if="currentPath" class="reader__comments">
      <div class="reader__comments-scroll">
        <div class="reader__comments-title">
          <i i-ri-chat-3-line />
          评论
        </div>
        <WalineComment :path="currentPath" />
      </div>
    </aside>
  </div>
</template>

<style scoped>
.reader {
  height: 100%;
  display: flex;
  min-height: 0;
  background: rgba(255, 255, 255, 0.55);
}

html.dark .reader {
  background: rgba(24, 24, 28, 0.4);
}

.reader__list {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 0;
  display: flex;
}

html.dark .reader__list {
  border-right-color: rgba(255, 255, 255, 0.08);
}

.reader__content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.reader__content-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 32px 44px 56px;
}

.reader__welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.4);
  padding: 40px;
  text-align: center;
}

html.dark .reader__welcome {
  color: rgba(255, 255, 255, 0.4);
}

.reader__welcome-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2f80ed, #56ccf2);
  color: #fff;
  font-size: 34px;
  margin-bottom: 8px;
}

.reader__welcome h2 {
  margin: 0;
  font-size: 20px;
  color: var(--va-c-text, #333);
}

.reader__welcome p {
  margin: 0;
  font-size: 13px;
}

.reader__comments {
  width: 320px;
  flex-shrink: 0;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 0;
  display: flex;
}

html.dark .reader__comments {
  border-left-color: rgba(255, 255, 255, 0.08);
}

.reader__comments-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}

.reader__comments-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--va-c-text, #333);
  margin-bottom: 8px;
}
</style>
