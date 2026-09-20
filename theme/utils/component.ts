import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

/**
 * 把路由记录里的组件变成可直接交给 `<component :is>` 的值。
 *
 * vue-router 对懒加载路由（valaxy 的文章页都是独立 chunk）把
 * `route.components.default` 存成 `() => import(...)`。直接传给 `:is`
 * 会被当成函数式组件，既渲染不出内容，也会在 Transition 内触发
 * `Cannot read properties of null (reading 'emitsOptions')`。
 *
 * 用 WeakMap 以原始 loader 为键缓存包装结果，保证同一路由每次解析
 * 拿到同一个异步组件实例，避免重复挂载。
 */
const asyncCache = new WeakMap<object, Component>()

export function toRenderableComponent(raw: unknown): Component | undefined {
  if (!raw)
    return undefined

  if (typeof raw !== 'function')
    return raw as Component

  const key = raw as object
  const cached = asyncCache.get(key)
  if (cached)
    return cached

  const wrapped = defineAsyncComponent(raw as () => Promise<Component>)
  asyncCache.set(key, wrapped)
  return wrapped
}
