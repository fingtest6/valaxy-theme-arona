<script setup lang="ts">
import type { Post } from 'valaxy'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommentEnabled } from '../../composables/comment'
import { useIsMobile } from '../../composables/useIsMobile'
import ArticleList from './ArticleList.vue'

defineProps<{
  /**
   * 当前文章的编译后组件（由 Desktop 通过路由解析）
   */
  component?: any
  /**
   * 当前文章路径，为空表示未选择文章
   */
  currentPath?: string
}>()

const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const commentEnabled = useCommentEnabled()
const showComments = computed(() => {
  const frontmatter = (route.meta as any)?.frontmatter
  return commentEnabled.value && frontmatter?.comment !== false
})

function openPost(post: Post) {
  router.push(post.path || '/')
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <!-- 桌面端：三栏布局 -->
  <div v-if="!isMobile" class="reader">
    <aside class="reader__list">
      <ArticleList @open="openPost" />
    </aside>

    <section class="reader__content">
      <!-- 结构分支置于过渡之外，仅对文章内容做 keyed 过渡，避免分支切换与离场动画叠加产生 DOM 竞态 -->
      <div v-if="component" class="reader__content-scroll">
        <Transition name="reader-page" mode="out-in">
          <div :key="currentPath" class="reader__content-inner">
            <component :is="component" />
          </div>
        </Transition>

        <aside v-if="currentPath && showComments" class="reader__comments">
          <div class="reader__comments-title">
            <i i-ri-chat-3-line />
            评论
          </div>
          <WalineComment :path="currentPath" />
        </aside>
      </div>
      <div v-else class="reader__welcome">
        <div class="reader__welcome-icon">
          <i i-ri-file-text-line />
        </div>
        <h2>欢迎阅读</h2>
        <p>在左侧列表选择一篇文章开始阅读</p>
      </div>
    </section>
  </div>

  <!-- 移动端：单栏，列表 → 文章 -->
  <div v-else class="reader reader--mobile">
    <div v-if="!currentPath" class="reader__list reader__list--mobile">
      <ArticleList @open="openPost" />
    </div>

    <template v-else>
      <div class="reader__mobile-bar">
        <button class="reader__back" @click="goBack">
          <i i-ri-arrow-left-line />
          返回列表
        </button>
      </div>

      <!-- 正文与评论在同一滚动容器内，跟随滚动 -->
      <div class="reader__mobile-scroll">
        <template v-if="component">
          <Transition name="reader-page" mode="out-in">
            <div :key="currentPath" class="reader__content reader__content--mobile">
              <component :is="component" />
            </div>
          </Transition>

          <aside v-if="showComments" class="reader__comments reader__comments--mobile">
            <div class="reader__comments-title">
              <i i-ri-chat-3-line />
              评论
            </div>
            <WalineComment :path="currentPath" />
          </aside>
        </template>

        <!-- 路由已切换但组件尚未解析完成：给出占位，避免把 undefined 交给 :is -->
        <div v-else class="reader__welcome">
          <div class="reader__welcome-icon">
            <i i-ri-loader-4-line class="reader__spinner" />
          </div>
          <h2>正在载入</h2>
          <p>文章内容载入中…</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.reader {
  height: 100%;
  display: flex;
  min-height: 0;
  background: var(--st-app-bg);
}

html.dark .reader {
  background: var(--st-app-bg-dark);
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
  overflow-x: hidden;
  padding: 32px 44px 56px;
}

.reader__content-inner {
  min-height: 0;
}

/* 欢迎页入场 */
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
  animation: st-fade-in var(--st-dur-base) var(--st-ease-out) backwards;
}

/* 文章切换过渡 */
.reader-page-enter-active {
  transition:
    opacity 0.24s ease,
    translate 0.24s var(--st-ease-out);
}

.reader-page-leave-active {
  transition: opacity 0.14s ease;
}

.reader-page-enter-from {
  opacity: 0;
  translate: 0 10px;
}

.reader-page-leave-to {
  opacity: 0;
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
  background: var(--st-avatar-gradient);
  color: #fff;
  font-size: 34px;
  margin-bottom: 8px;
  box-shadow: 0 12px 28px rgba(47, 128, 237, 0.35);
  animation: st-float 4s ease-in-out infinite;
}

.reader__welcome h2 {
  margin: 0;
  font-size: 20px;
  color: var(--va-c-text);
}

.reader__welcome p {
  margin: 0;
  font-size: 13px;
}

.reader__spinner {
  animation: st-spin 1s linear infinite;
}

.reader__comments {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

html.dark .reader__comments {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.reader__comments-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--va-c-text);
  margin-bottom: 8px;
}

/* ---------- 移动端 ---------- */
.reader--mobile {
  flex-direction: column;
}

.reader__list--mobile {
  width: 100%;
  border-right: none;
  flex: 1;
  min-height: 0;
}

.reader__mobile-bar {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

html.dark .reader__mobile-bar {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.reader__back {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--va-c-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

html.dark .reader__back {
  background: rgba(255, 255, 255, 0.1);
}

/* 正文与评论共用的滚动容器 */
.reader__mobile-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.reader__content--mobile {
  padding: 20px 18px 8px;
}

.reader__comments--mobile {
  width: 100%;
  margin-top: 0;
  padding: 16px 18px 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

html.dark .reader__comments--mobile {
  border-top-color: rgba(255, 255, 255, 0.08);
}
</style>
