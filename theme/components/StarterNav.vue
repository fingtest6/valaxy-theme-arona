<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

// import { computed } from 'vue'
// import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'

// const route = useRoute()
// const isIndex = computed(() => route.path.replace(/index.html$/, '') === '/')

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
</script>

<template>
  <nav w="full" class="flex items-center py-1 font-bold">
    <RouterLink class="text-xl" to="/" :aria-label="siteConfig.title" style="color: white">
      <span>{{ siteConfig.title }}</span>
    </RouterLink>
    <div class="ml-6">
      <template v-for="(item, i) in themeConfig.nav" :key="i">
        <AppLink
          :to="item.link"
          rel="noopener"
          class="nav-link"
        >
          {{ item.text }}
        </AppLink>
        <span v-if="i !== themeConfig.nav.length - 1" class="ml-2 mr-2">·</span>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  color: white;
}
</style>
