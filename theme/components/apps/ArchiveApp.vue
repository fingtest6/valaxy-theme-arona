<script setup lang="ts">
import type { Post } from 'valaxy'
import { usePostList } from 'valaxy'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { resolveTitle, useDesktop } from '../../composables/desktop'

const desktop = useDesktop()
const router = useRouter()
const posts = usePostList()

interface MonthGroup {
  key: string
  label: string
  count: number
  posts: Post[]
}

interface YearGroup {
  year: string
  count: number
  months: MonthGroup[]
}

const groups = computed<YearGroup[]>(() => {
  const map = new Map<string, Map<string, Post[]>>()
  for (const post of posts.value) {
    if (!post.date)
      continue
    const d = new Date(post.date)
    const year = String(d.getFullYear())
    const monthKey = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = `${d.getMonth() + 1} 月`
    if (!map.has(year))
      map.set(year, new Map())
    const months = map.get(year)!
    if (!months.has(monthKey))
      months.set(monthKey, [])
    // 用 key 附带 label，直接复用
    ;(months.get(monthKey) as any).__label = monthLabel
    months.get(monthKey)!.push(post)
  }

  const result: YearGroup[] = []
  for (const [year, months] of map) {
    const monthGroups: MonthGroup[] = []
    let yearCount = 0
    for (const [key, list] of months) {
      monthGroups.push({
        key,
        label: (list as any).__label || key.slice(5),
        count: list.length,
        posts: list,
      })
      yearCount += list.length
    }
    result.push({ year, count: yearCount, months: monthGroups })
  }
  result.sort((a, b) => Number(b.year) - Number(a.year))
  return result
})

const totalPosts = computed(() => posts.value.length)

// 统计信息
const earliest = computed(() => {
  let earliestDate: Date | null = null
  for (const p of posts.value) {
    if (!p.date)
      continue
    const d = new Date(p.date)
    if (!earliestDate || d.getTime() < earliestDate.getTime())
      earliestDate = d
  }
  return earliestDate
})

const expanded = ref<Set<string>>(new Set())

function toggle(key: string) {
  const next = new Set(expanded.value)
  if (next.has(key))
    next.delete(key)
  else
    next.add(key)
  expanded.value = next
}

function openPost(post: Post) {
  desktop.openArticle(post)
  router.push(post.path || '/')
}
</script>

<template>
  <div class="archive-app">
    <div class="archive-app__stats">
      <div class="stat">
        <span class="stat__num">{{ totalPosts }}</span>
        <span class="stat__label">文章总数</span>
      </div>
      <div class="stat">
        <span class="stat__num">{{ groups.length }}</span>
        <span class="stat__label">年份</span>
      </div>
      <div v-if="earliest" class="stat">
        <span class="stat__num">{{ earliest.getFullYear() }}</span>
        <span class="stat__label">最早写作</span>
      </div>
    </div>

    <div class="archive-app__list">
      <div v-for="group in groups" :key="group.year" class="year">
        <button class="year__head" @click="toggle(group.year)">
          <i i-ri-arrow-right-s-line class="year__caret" :class="{ 'is-open': expanded.has(group.year) }" />
          <span class="year__label">{{ group.year }} 年</span>
          <span class="year__count">{{ group.count }}</span>
        </button>

        <div v-show="expanded.has(group.year)" class="year__body">
          <div v-for="month in group.months" :key="month.key" class="month">
            <button class="month__head" @click="toggle(month.key)">
              <i i-ri-arrow-right-s-line class="year__caret" :class="{ 'is-open': expanded.has(month.key) }" />
              <span class="month__label">{{ month.label }}</span>
              <span class="month__count">{{ month.count }}</span>
            </button>

            <div v-show="expanded.has(month.key)" class="month__body">
              <button
                v-for="post in month.posts"
                :key="post.path"
                class="month__post"
                @click="openPost(post)"
              >
                <span class="month__post-title">{{ resolveTitle(post.title) }}</span>
                <time class="month__post-date">{{ new Date(post.date!).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) }}</time>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!groups.length" class="archive-app__empty">
        <i i-ri-archive-line />
        <p>暂无归档</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.55);
}

html.dark .archive-app {
  background: rgba(24, 24, 28, 0.4);
}

.archive-app__stats {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  flex-shrink: 0;
}

html.dark .archive-app__stats {
  border-bottom-color: rgba(255, 255, 255, 0.07);
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.04);
}

html.dark .stat {
  background: rgba(255, 255, 255, 0.07);
}

.stat__num {
  font-size: 22px;
  font-weight: 800;
  color: var(--st-accent, #0078e7);
}

.stat__label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

html.dark .stat__label {
  color: rgba(255, 255, 255, 0.5);
}

.archive-app__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
}

.year__head,
.month__head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: var(--va-c-text, #333);
}

.year__head:hover,
.month__head:hover {
  background: rgba(0, 0, 0, 0.05);
}

html.dark .year__head:hover,
html.dark .month__head:hover {
  background: rgba(255, 255, 255, 0.08);
}

.year__caret {
  font-size: 16px;
  transition: transform 0.18s ease;
  color: rgba(0, 0, 0, 0.4);
}

.year__caret.is-open {
  transform: rotate(90deg);
}

.year__label {
  font-size: 16px;
  font-weight: 700;
}

.month__label {
  font-size: 14px;
  font-weight: 600;
}

.year__count,
.month__count {
  margin-left: auto;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  background: rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  padding: 2px 8px;
}

html.dark .year__count,
html.dark .month__count {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.year__body {
  padding-left: 16px;
}

.month__body {
  padding-left: 24px;
  display: flex;
  flex-direction: column;
}

.month__post {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: var(--va-c-text, #333);
}

.month__post:hover {
  background: rgba(0, 0, 0, 0.05);
}

html.dark .month__post:hover {
  background: rgba(255, 255, 255, 0.08);
}

.month__post-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month__post-date {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}

.archive-app__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 0;
  color: rgba(0, 0, 0, 0.35);
}

.archive-app__empty i {
  font-size: 40px;
}
</style>
