import { useAppStore } from 'valaxy'
import { computed, ref } from 'vue'
import { MOBILE_BREAKPOINT } from '../shared/layout'

// 事件驱动的视口检测：matchMedia change + resize 双保险，模块级共享，无轮询
const directMobile = ref(false)

function updateDirect() {
  directMobile.value = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
}

if (typeof window !== 'undefined') {
  updateDirect()
  if (typeof matchMedia !== 'undefined')
    matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).addEventListener('change', updateDirect)
  // resize 兜底（覆盖 matchMedia 事件不可用的环境）
  window.addEventListener('resize', updateDirect, { passive: true })
}

/**
 * 共享的移动端检测。
 * 主信号使用 Valaxy appStore.isMobile，并以模块级 matchMedia/resize 检测兜底，二者取或。
 */
export function useIsMobile() {
  const appStore = useAppStore()
  return computed(() => appStore.isMobile || directMobile.value)
}
