<script lang="ts" setup>
import { capitalize, computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSiteConfig, useValaxyConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'
import pkg from 'valaxy/package.json'
import { useThemeConfig } from '../composables'

const { t } = useI18n()
const config = useValaxyConfig()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const year = new Date().getFullYear()
const footerRef = ref<HTMLElement>()
const router = useRouter()
const route = useRoute()
const isThisYear = computed(() => {
  return year === themeConfig.value.footer.since
})
const poweredHtml = computed(() => t('footer.powered', [`<a href="https://valaxy.site/" target="_blank" rel="noopener">Valaxy</a> v${pkg.version}`]))
const footerIcon = computed(() => themeConfig.value.footer.icon!)

function adjustFooterPosition() {
  const footer = footerRef.value
  if (!footer)
    return

  if (route.path === '/') {
    // 主页：固定页脚
    footer.style.position = 'fixed'
  }
  else if (route.path.startsWith('/posts/')) { // 动态匹配 /posts/ 开头的路径
    // /posts/ 及其子页面：相对定位
    footer.style.position = 'relative'
  }
  else if (route.path === '/allposts') {
    // 主页：固定页脚
    footer.style.position = 'relative'
  }
  else {
    // 非主页时根据页面高度动态调整
    const pageHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight

    if (pageHeight > windowHeight) {
      footer.style.position = 'relative'
    }
    else {
      footer.style.position = 'fixed'
    }
  }
}

// 监听窗口大小变化
function handleResize() {
  adjustFooterPosition()
}

// 使用 Vue Router 的导航守卫
// eslint-disable-next-line unused-imports/no-unused-vars
router.afterEach((to, from) => {
  setTimeout(() => {
    adjustFooterPosition()
  }, 300) // 增加延迟时间以确保 DOM 更新完成
})

onMounted(() => {
  adjustFooterPosition()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <footer ref="footerRef" class="va-footer" text="center sm" style="position: relative; bottom: 0;left: 0;width: 100%;z-index: 10;">
    <div v-if="themeConfig.footer.beian?.enable && themeConfig.footer.beian.icp" class="beian" m="y-2">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
        {{ themeConfig.footer.beian.icp }}
      </a>
    </div>
    <div class="copyright flex items-center justify-center" p="1">
      <span>
        &copy;
        <template v-if="!isThisYear">
          {{ themeConfig.footer.since }} -
        </template>
        {{ year }}
      </span>
      <a m="x-2" class="inline-flex animate-pulse" :href="footerIcon.url" target="_blank" :title="footerIcon.title" />
      <span>{{ siteConfig.author.name }}</span>
    </div>
    <div v-if="themeConfig.footer.powered" class="powered" m="2">
      <span v-html="poweredHtml" /> | <span>{{ t('footer.theme') }} - <a :href="themeConfig.pkg.homepage" :title="`valaxy-theme-${config.theme}`" target="_blank">{{ capitalize(config.theme) }}</a> v{{ themeConfig.pkg.version }}</span>
    </div>
    <slot />
  </footer>
</template>
