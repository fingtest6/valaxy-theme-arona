<script setup lang="ts">
import { useSiteConfig } from 'valaxy'
import valaxyPkg from 'valaxy/package.json'
import { computed } from 'vue'
import { useThemeConfig } from '../../composables'

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const author = computed(() => siteConfig.value.author)
const social = computed(() => siteConfig.value.social)
const description = computed(() => siteConfig.value.description)

const valaxyVersion = computed(() => valaxyPkg.version || '')
const themeVersion = computed(() => themeConfig.value.pkg?.version || '0.2.0')
const themeName = computed(() => {
  const name = themeConfig.value.pkg?.name || 'valaxy-theme-arona'
  return name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
})
</script>

<template>
  <div class="about-app">
    <div class="about-app__hero">
      <div class="about-app__avatar">
        <img v-if="author.avatar" :src="author.avatar" :alt="author.name">
        <span v-else>{{ (author.name || 'A')[0] }}</span>
      </div>
      <h2 class="about-app__name">{{ author.name }}</h2>
      <p v-if="description" class="about-app__desc">{{ description }}</p>
    </div>

    <div class="about-app__social">
      <a
        v-for="s in social"
        :key="s.name"
        class="social-btn"
        :href="s.link"
        target="_blank"
        rel="noopener noreferrer"
        :title="s.name"
      >
        <i :class="s.icon" :style="{ color: s.color }" />
        <span>{{ s.name }}</span>
      </a>
    </div>

    <div class="about-app__footer">
      <div class="about-app__versions">
        <span v-if="valaxyVersion">Valaxy v{{ valaxyVersion }}</span>
        <span v-if="themeVersion">{{ themeName }} {{ themeVersion }}</span>
      </div>
      <p>Powered by <a href="https://valaxy.site" target="_blank" rel="noopener">Valaxy</a></p>
    </div>
  </div>
</template>

<style scoped>
.about-app {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.55);
}

html.dark .about-app {
  background: rgba(24, 24, 28, 0.4);
}

.about-app__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 24px 24px;
  text-align: center;
}

.about-app__avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2f80ed, #56ccf2);
  color: #fff;
  font-size: 34px;
  font-weight: 800;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.about-app__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-app__name {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--va-c-text, #1d1d1f);
}

.about-app__desc {
  margin: 0;
  max-width: 320px;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.55);
}

html.dark .about-app__desc {
  color: rgba(255, 255, 255, 0.55);
}

.about-app__social {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  padding: 8px 24px 24px;
}

.social-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--va-c-text, #333);
  transition: background 0.15s ease;
}

.social-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

html.dark .social-btn {
  background: rgba(255, 255, 255, 0.1);
}

html.dark .social-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.social-btn i {
  font-size: 16px;
}

.about-app__footer {
  margin-top: auto;
  padding: 16px 24px;
  text-align: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(0, 0, 0, 0.07);
}

.about-app__versions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 6px;
  font-weight: 600;
}

.about-app__versions span {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
}

html.dark .about-app__versions span {
  background: rgba(255, 255, 255, 0.1);
}

.about-app__footer p {
  margin: 0;
}

html.dark .about-app__footer {
  color: rgba(255, 255, 255, 0.4);
  border-top-color: rgba(255, 255, 255, 0.07);
}

.about-app__footer a {
  color: var(--st-accent, #0078e7);
  text-decoration: none;
}
</style>
