<script setup lang="ts">
import notesData from 'virtual:arona/notes'
import { computed, ref, watch } from 'vue'
import { useSelectedNote } from '../../composables/apps'
import { formatDate } from '../../utils/format'

const notes = notesData
const activeIndex = ref(0)
const selectedNoteSlug = useSelectedNote()

watch(selectedNoteSlug, (slug) => {
  if (!slug)
    return
  const index = notes.findIndex(note => note.slug === slug)
  if (index >= 0)
    activeIndex.value = index
  selectedNoteSlug.value = null
}, { immediate: true })

const activeNote = computed(() => notes[activeIndex.value] || null)

function select(index: number) {
  activeIndex.value = index
}
</script>

<template>
  <div class="notes-app">
    <aside class="notes-app__sidebar">
      <div class="notes-app__sidebar-header">
        <i i-ri-sticky-note-line />
        <span>笔记</span>
        <em>{{ notes.length }}</em>
      </div>
      <div class="notes-app__list">
        <button
          v-for="(note, i) in notes"
          :key="note.slug"
          class="notes-app__item"
          :class="{ 'is-active': i === activeIndex }"
          @click="select(i)"
        >
          <span class="notes-app__item-title">{{ note.title }}</span>
          <span v-if="note.date" class="notes-app__item-date">{{ formatDate(note.date) }}</span>
        </button>
      </div>
    </aside>

    <section class="notes-app__detail">
      <template v-if="activeNote">
        <header class="notes-app__header">
          <h2 class="notes-app__title">
            {{ activeNote.title }}
          </h2>
          <div class="notes-app__meta">
            <span v-if="activeNote.date">
              <i i-ri-calendar-line />
              {{ formatDate(activeNote.date) }}
            </span>
            <span v-for="tag in activeNote.tags || []" :key="tag" class="notes-app__tag">
              #{{ tag }}
            </span>
          </div>
        </header>
        <div class="notes-app__content" v-html="activeNote.html" />
      </template>

      <div v-else class="notes-app__empty">
        <i i-ri-sticky-note-line />
        <p>还没有笔记</p>
        <span>在 pages/notes 目录添加 md 文件即可</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.notes-app {
  height: 100%;
  display: flex;
  overflow: hidden;
  background: var(--st-app-bg);
  color: var(--va-c-text);
}

html.dark .notes-app {
  background: var(--st-app-bg-dark);
}

.notes-app__sidebar {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.22);
}

html.dark .notes-app__sidebar {
  border-right-color: rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.14);
}

.notes-app__sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 14px 10px;
  font-size: 13px;
  font-weight: 700;
}

.notes-app__sidebar-header i {
  color: var(--st-accent);
  font-size: 18px;
}

.notes-app__sidebar-header em {
  margin-left: auto;
  font-style: normal;
  font-size: 11px;
  font-weight: 500;
  opacity: 0.5;
}

.notes-app__list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 8px 12px;
}

.notes-app__item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.notes-app__item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.notes-app__item.is-active {
  background: color-mix(in srgb, var(--st-accent) 14%, transparent);
}

html.dark .notes-app__item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.notes-app__item-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notes-app__item-date {
  font-size: 11px;
  opacity: 0.45;
}

.notes-app__detail {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 20px 24px;
}

.notes-app__title {
  margin: 0;
  font-size: 22px;
  line-height: 1.35;
}

.notes-app__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.55;
}

.notes-app__meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.notes-app__tag {
  color: var(--st-accent);
  opacity: 1;
}

.notes-app__content {
  margin-top: 22px;
  font-size: 14px;
  line-height: 1.8;
}

.notes-app__content :deep(h1),
.notes-app__content :deep(h2),
.notes-app__content :deep(h3) {
  margin: 1.2em 0 0.6em;
  line-height: 1.35;
}

.notes-app__content :deep(p) {
  margin: 0 0 1em;
}

.notes-app__content :deep(ul),
.notes-app__content :deep(ol) {
  margin: 0 0 1em;
  padding-left: 1.4em;
}

.notes-app__content :deep(code) {
  padding: 2px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.08);
  font-size: 0.9em;
}

html.dark .notes-app__content :deep(code) {
  background: rgba(255, 255, 255, 0.12);
}

.notes-app__content :deep(pre) {
  overflow: auto;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
}

html.dark .notes-app__content :deep(pre) {
  background: rgba(255, 255, 255, 0.08);
}

.notes-app__content :deep(a) {
  color: var(--st-accent);
}

.notes-app__empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0.45;
}

.notes-app__empty i {
  font-size: 46px;
}

.notes-app__empty p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.notes-app__empty span {
  font-size: 12px;
}
</style>
