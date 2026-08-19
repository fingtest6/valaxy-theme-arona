import { useAppStore } from 'valaxy'
import { computed, ref } from 'vue'

// 兜底信号：直接读取 window.innerWidth，随 resize / 定时刷新更新，
// 不依赖组件生命周期（模块级），避免事件丢失导致检测失效。
const directMobile = ref(false)

function updateDirect() {
  directMobile.value = typeof window !== 'undefined' && window.innerWidth <= 768
}

if (typeof window !== 'undefined') {
  updateDirect()
  window.addEventListener('resize', updateDirect)
  // 额外兜底：即使 resize/matchMedia 事件异常丢失，1 秒内也会校正
  setInterval(updateDirect, 1000)
}

/**
 * 共享的移动端检测。
 * 主信号使用 Valaxy appStore.isMobile（之前可用的方式），
 * 并用模块级 directMobile（resize + 定时）作为兜底，二者取或。
 */
export function useIsMobile() {
  const appStore = useAppStore()
  return computed(() => appStore.isMobile || directMobile.value)
}
