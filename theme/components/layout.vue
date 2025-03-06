<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from 'valaxy'
import BG_DAY from '../imgs/BG_AronaRoom.webp'
import BG_NIGHT from '../imgs/BG_AronaRoom_Night.webp'

const appStore = useAppStore()
onMounted(() => {
  const preloadImages = [BG_DAY, BG_NIGHT]
  preloadImages.forEach((src) => {
    new Image().src = src
  })
})
</script>

<template>
  <!-- 外层容器保持原样 -->
  <div class="antialiased">
    <!-- 原有导航和内容结构完全不变 -->
    <div class="flex items-center bg-gray-100/10 px-4 backdrop-blur-md">
      <StarterNav />
      <button
        type="button"
        aria-label="Toggle Dark Mode"
        class="ml-auto rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="appStore.toggleDarkWithTransition"
      >
        <div v-if="!appStore.isDark" class="i-ri-sun-line text-lg" />
        <div v-else class="i-ri-moon-line text-lg" />
      </button>
    </div>

    <main class="mx-auto max-w-3xl px-4 xl:max-w-5xl sm:px-6 xl:px-0">
      <slot>
        <RouterView v-slot="{ Component: routeComponent }">
          <component :is="routeComponent">
            <template #main-header>
              <slot name="main-header" />
            <!-- 原有插槽结构保持不变 -->
            </template>
          </component>
        </RouterView>
      </slot>
    </main>

    <!-- 新增背景容器 -->
    <div class="fixed inset-0 overflow-hidden -z-[999]">
      <img
        :src="appStore.isDark ? BG_NIGHT : BG_DAY"
        alt="background"
        class="h-screen min-h-[600px] w-full scale-105 object-cover object-center transition-opacity duration-300"
        :class="{ 'opacity-80': appStore.isDark }" style="clip-path: inset(0 0 0 0)"
      >
    </div>

    <StarterHelper />
    <StarterFooter>
      <slot name="footer" />
    </StarterFooter>
  </div>
</template>

<style>
/* 必须添加的全局样式 */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html,
  body {
    @apply m-0 p-0 w-full h-full overflow-x-hidden;
  }
  /* 修复移动端100vh问题 */
}
img {
  transition:
    opacity 0.5s ease,
    transform 0.3s ease;
}

/* 暗黑模式滤镜调整 */
.dark img {
  filter: brightness(0.8) contrast(1.1);
}
/* 你的原有样式保持不变，新增字体定义 */
@font-face {
  font-family: 'MiSans';
  src: url('fonts/MiSans-Normal.woff2') format('woff2');
  font-weight: 400;
}

body,
h1,
h2,
h3,
h4,
h5,
h6,
p,
button,
input {
  font-family: 'MiSans', sans-serif !important;
}
</style>
