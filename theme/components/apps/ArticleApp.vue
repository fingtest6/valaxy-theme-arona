<script setup lang="ts">
import type { Post } from 'valaxy'
import { computed, onMounted, onUpdated, ref } from 'vue'
import { useCommentEnabled } from '../../composables/comment'
import { resolveTitle } from '../../composables/desktop'

const props = defineProps<{
  post?: Post
  component?: any
  /**
   * 是否为当前激活的文章窗口（与路由一致），激活时渲染实时内容
   */
  active?: boolean
}>()

const commentEnabled = useCommentEnabled()
const showComments = computed(() => commentEnabled.value && props.post?.comment !== false)

// 冻结快照缓存：path -> 渲染后的 HTML（模块级，跨窗口实例共享）
const snapshotCache = new Map<string, string>()

const contentRef = ref<HTMLElement>()
const snapshotHtml = ref('')

function capture() {
  if (!props.active || !contentRef.value)
    return
  const html = contentRef.value.innerHTML
  if (html && html.trim()) {
    snapshotCache.set(props.post?.path || '', html)
    snapshotHtml.value = html
  }
}

onMounted(() => {
  if (props.active) {
    capture()
    // 异步编译组件渲染完成后再次捕获
    setTimeout(capture, 120)
    setTimeout(capture, 500)
  }
  else {
    snapshotHtml.value = snapshotCache.get(props.post?.path || '') || ''
  }
})

onUpdated(() => {
  if (props.active)
    setTimeout(capture, 0)
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
  background: rgba(255, 255, 255, 0.55);
}

html.dark .article-app {
  background: rgba(24, 24, 28, 0.4);
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
  color: var(--va-c-primary, #0078e7);
  background: rgba(0, 120, 231, 0.12);
  background: color-mix(in srgb, var(--va-c-primary, #0078e7) 12%, transparent);
}

html.dark .article-app__pending-tag {
  color: var(--va-c-primary, #4ea1ff);
  background: rgba(78, 161, 255, 0.18);
  background: color-mix(in srgb, var(--va-c-primary, #4ea1ff) 18%, transparent);
}

.article-app__pending-hint {
  font-size: 12px;
}
</style>
