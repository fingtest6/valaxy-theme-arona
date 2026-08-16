<script setup lang="ts">
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useThemeConfig } from '../../composables'

const themeConfig = useThemeConfig()
const siteConfig = useSiteConfig()

interface Friend {
  name: string
  link: string
  avatar?: string
  description?: string
  icon?: string
}

const friends = computed<Friend[]>(() => {
  const configured = themeConfig.value.friends
  if (configured && configured.length)
    return configured

  // 回退到社交链接
  return (siteConfig.value.social || []).map(s => ({
    name: s.name,
    link: s.link,
    icon: s.icon,
    color: s.color,
  } as any))
})

function avatarUrl(f: any) {
  return f.avatar || ''
}
</script>

<template>
  <div class="friends-app">
    <div class="friends-app__header">
      <h2>友情链接</h2>
      <p>这些是我常去的地方</p>
    </div>

    <div class="friends-app__grid">
      <a
        v-for="f in friends"
        :key="f.link"
        class="friend-card"
        :href="f.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="friend-card__avatar">
          <img v-if="f.avatar" :src="f.avatar" :alt="f.name">
          <i v-else-if="f.icon" :class="f.icon" />
          <span v-else>{{ (f.name || '?')[0] }}</span>
        </div>
        <div class="friend-card__info">
          <span class="friend-card__name">{{ f.name }}</span>
          <span v-if="f.description" class="friend-card__desc">{{ f.description }}</span>
        </div>
      </a>

      <div v-if="!friends.length" class="friends-app__empty">
        <i i-ri-links-line />
        <p>还没有友链，快去配置吧</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friends-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.55);
}

html.dark .friends-app {
  background: rgba(24, 24, 28, 0.4);
}

.friends-app__header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  flex-shrink: 0;
}

html.dark .friends-app__header {
  border-bottom-color: rgba(255, 255, 255, 0.07);
}

.friends-app__header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 800;
  color: var(--va-c-text, #1d1d1f);
}

.friends-app__header p {
  margin: 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
}

.friends-app__grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px 20px 20px;
  align-content: start;
}

.friend-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  text-decoration: none;
  color: var(--va-c-text, #333);
  transition: transform 0.15s ease, background 0.15s ease;
}

.friend-card:hover {
  background: rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}

html.dark .friend-card {
  background: rgba(255, 255, 255, 0.07);
}

html.dark .friend-card:hover {
  background: rgba(255, 255, 255, 0.12);
}

.friend-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2f80ed, #56ccf2);
  color: #fff;
  font-weight: 700;
  font-size: 18px;
}

.friend-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-card__avatar i {
  font-size: 22px;
}

.friend-card__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.friend-card__name {
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-card__desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.dark .friend-card__desc {
  color: rgba(255, 255, 255, 0.5);
}

.friends-app__empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 0;
  color: rgba(0, 0, 0, 0.35);
}

.friends-app__empty i {
  font-size: 40px;
}
</style>
