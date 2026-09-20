<script setup lang="ts">
import type { Component } from 'vue'
import type { ArticleInput } from '../../composables/desktop'
import { computed, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import { getArticleSnapshot, setArticleSnapshot } from '../../composables/articleSnapshot'
import { useCommentEnabled } from '../../composables/comment'
import { resolveTitle } from '../../composables/desktop'

const props = defineProps<{
  post?: ArticleInput
  component?: Component
  /**
   * 是否为当前激活的文章窗口（与路由一致），激活时渲染实时内容
   */
  active?: boolean
}>()

const commentEnabled = useCommentEnabled()
const showComments = computed(() => commentEnabled.value && props.post?.comment !== false)

const contentRef = ref<HTMLElement>()
const snapshotHtml = ref('')

/** 异步编译的组件渲染完成后再次捕获 */
const CAPTURE_DELAYS = [120, 500]
const mountTimers: Array<ReturnType<typeof setTimeout>> = []
let updateTimer: ReturnType<typeof setTimeout> | undefined

function capture() {
  if (!props.active || !contentRef.value)
    return
  const html = contentRef.value.innerHTML
  if (!html || !html.trim())
    return
  setArticleSnapshot(props.post?.path || '', html)
  snapshotHtml.value = html
}

onMounted(() => {
  if (!props.active) {
    snapshotHtml.value = getArticleSnapshot(props.post?.path || '')
    return
  }
  capture()
  CAPTURE_DELAYS.forEach(delay => mountTimers.push(setTimeout(capture, delay)))
})

onUpdated(() => {
  if (!props.active)
    return
  // 合并高频更新，避免每次 update 都排一个新定时器
  clearTimeout(updateTimer)
  updateTimer = setTimeout(capture, 0)
})

onBeforeUnmount(() => {
  mountTimers.forEach(clearTimeout)
  mountTimers.length = 0
  clearTimeout(updateTimer)
})

const fallbackTitle = computed(() => resolveTitle(props.post?.title))
const pendingTags = computed(() =>
  Array.isArray(props.post?.tags) ? props.post.tags : [],
)
</script>

<template>
  <div class="article-app">
    <!-- 激活：实时渲染 -->
    <div v-if="active" class="article-app__scroll">
      <div ref="contentRef" class="article-app__live">
        <component :is="component" v-if="component" />
      </div>
      <WalineComment v-if="post && showComments" :path="post.path" />
    </div>

    <!-- 后台：冻结快照，看起来仍在显示文章 -->
    <div v-else class="article-app__scroll">
      <div v-if="snapshotHtml" class="article-snapshot" v-html="snapshotHtml" />
      <div v-else class="article-app__pending">
        <span class="article-app__pending-title">{{ fallbackTitle }}</span>
        <div v-if="pendingTags.length" class="article-app__pending-tags">
          <span v-for="tag in pendingTags" :key="tag" class="article-app__pending-tag">#{{ tag }}</span>
        </div>
        <span class="article-app__pending-hint">点击窗口即可切换阅读</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--st-app-bg);
}

html.dark .article-app {
  background: var(--st-app-bg-dark);
}

.article-app__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 36px 48px;
}

.article-app__live {
  min-height: 0;
}

/* 冻结快照：禁止交互，点击会穿透到窗口触发聚焦切换 */
.article-snapshot {
  pointer-events: none;
  user-select: none;
}

.article-app__pending {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  color: rgba(0, 0, 0, 0.45);
}

html.dark .article-app__pending {
  color: rgba(255, 255, 255, 0.45);
}

.article-app__pending-title {
  font-size: 16px;
  font-weight: 700;
}

.article-app__pending-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.article-app__pending-tag {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--st-accent);
  background: color-mix(in srgb, var(--st-accent) 12%, transparent);
}

html.dark .article-app__pending-tag {
  background: color-mix(in srgb, var(--st-accent) 18%, transparent);
}

.article-app__pending-hint {
  font-size: 12px;
}
</style>
