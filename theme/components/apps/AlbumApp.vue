<script setup lang="ts">
import type { AlbumPhoto } from '../../types'
import albumData from 'virtual:arona/album'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSelectedAlbumPhoto } from '../../composables/apps'

const album = albumData
const selectedFilename = useSelectedAlbumPhoto()
const photos = computed<AlbumPhoto[]>(() => album.photos)

const activeIndex = ref<number | null>(null)

const activePhoto = computed(() => {
  if (activeIndex.value === null)
    return null
  return photos.value[activeIndex.value] || null
})

function open(index: number) {
  activeIndex.value = index
}

function close() {
  activeIndex.value = null
}

function prev() {
  if (activeIndex.value === null || !photos.value.length)
    return
  activeIndex.value = (activeIndex.value - 1 + photos.value.length) % photos.value.length
}

function next() {
  if (activeIndex.value === null || !photos.value.length)
    return
  activeIndex.value = (activeIndex.value + 1) % photos.value.length
}

function onKeydown(event: KeyboardEvent) {
  if (activeIndex.value === null)
    return
  if (event.key === 'Escape')
    close()
  else if (event.key === 'ArrowLeft')
    prev()
  else if (event.key === 'ArrowRight')
    next()
}

watch(selectedFilename, (filename) => {
  if (!filename)
    return
  const index = photos.value.findIndex(photo => photo.filename === filename)
  if (index >= 0)
    open(index)
  selectedFilename.value = null
}, { immediate: true })

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="album-app">
    <header class="album-app__header">
      <div class="album-app__heading">
        <h2>{{ album.title }}</h2>
        <div
          v-if="album.description"
          class="album-app__description"
          v-html="album.description"
        />
      </div>
      <span class="album-app__count">{{ photos.length }} 张</span>
    </header>
    <div v-if="photos.length" class="album-app__grid">
      <div
        v-for="(photo, i) in photos"
        :key="photo.src"
        class="album-card"
        role="button"
        tabindex="0"
        @click="open(i)"
        @keydown.enter="open(i)"
      >
        <img :src="photo.src" :alt="photo.title" loading="lazy">
        <span v-if="photo.title" class="album-card__title">{{ photo.title }}</span>
      </div>
    </div>
    <div v-else class="album-app__empty">
      <i i-ri-gallery-line />
      <p>相册里还没有照片</p>
      <span>把图片放到 photos 目录即可</span>
    </div>

    <Teleport to="body">
      <div v-if="activePhoto" class="album-lightbox" @click.self="close">
        <button class="album-lightbox__close" title="关闭" @click="close">
          <i i-ri-close-line />
        </button>
        <button class="album-lightbox__nav is-prev" title="上一张" @click="prev">
          <i i-ri-arrow-left-s-line />
        </button>
        <figure class="album-lightbox__figure">
          <img :src="activePhoto.src" :alt="activePhoto.title">
          <figcaption v-if="activePhoto.title || activePhoto.description">
            <strong v-if="activePhoto.title">{{ activePhoto.title }}</strong>
            <span v-if="activePhoto.description">{{ activePhoto.description }}</span>
          </figcaption>
        </figure>
        <button class="album-lightbox__nav is-next" title="下一张" @click="next">
          <i i-ri-arrow-right-s-line />
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.album-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--st-app-bg);
  color: var(--va-c-text);
}

html.dark .album-app {
  background: var(--st-app-bg-dark);
}

.album-app__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 12px;
  flex-shrink: 0;
}

.album-app__header h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
}

.album-app__description {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.55;
}

.album-app__description :deep(p) {
  margin: 0;
}

.album-app__count {
  flex-shrink: 0;
  font-size: 12px;
  opacity: 0.5;
}

.album-app__grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  align-content: start;
  gap: 10px;
  padding: 0 14px 16px;
}

.album-card {
  position: relative;
  display: block;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.4);
  cursor: zoom-in;
  aspect-ratio: 4 / 3;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.album-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
}

html.dark .album-card {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
}

.album-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.album-card__title {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 18px 10px 8px;
  font-size: 12px;
  color: #fff;
  text-align: left;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.62));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-app__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 200px;
  opacity: 0.45;
}

.album-app__empty i {
  font-size: 46px;
}

.album-app__empty p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.album-app__empty span {
  font-size: 12px;
}

.album-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 72px;
  background: rgba(10, 10, 14, 0.82);
  backdrop-filter: blur(8px);
  animation: album-fade-in 0.18s ease;
}

.album-lightbox__close,
.album-lightbox__nav {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition:
    background 0.15s ease,
    scale 0.15s ease;
}

.album-lightbox__close:hover,
.album-lightbox__nav:hover {
  background: var(--st-app-bg);
}

.album-lightbox__close:active,
.album-lightbox__nav:active {
  scale: 0.92;
}

.album-lightbox__close {
  top: 18px;
  right: 18px;
  width: 38px;
  height: 38px;
  font-size: 20px;
}

.album-lightbox__nav {
  top: 50%;
  width: 44px;
  height: 44px;
  font-size: 26px;
  transform: translateY(-50%);
}

.album-lightbox__nav.is-prev {
  left: 16px;
}

.album-lightbox__nav.is-next {
  right: 16px;
}

.album-lightbox__figure {
  max-width: min(100%, 1100px);
  max-height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.album-lightbox__figure img {
  max-width: 100%;
  max-height: calc(100vh - 140px);
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.album-lightbox__figure figcaption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.86);
  text-align: center;
}

.album-lightbox__figure figcaption strong {
  font-size: 14px;
}

.album-lightbox__figure figcaption span {
  font-size: 12px;
  opacity: 0.7;
}

@keyframes album-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .album-lightbox {
    padding: 48px 16px;
  }

  .album-lightbox__nav {
    width: 36px;
    height: 36px;
    font-size: 22px;
  }

  .album-lightbox__nav.is-prev {
    left: 6px;
  }

  .album-lightbox__nav.is-next {
    right: 6px;
  }
}
.album-app__heading {
  min-width: 0;
}
</style>
