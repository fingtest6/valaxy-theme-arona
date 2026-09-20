/**
 * 文章窗口「冻结快照」缓存
 *
 * 必须放在独立模块里：`<script setup>` 的顶层代码会被编译进 `setup()`，
 * 写在那里等于每个组件实例各持一份，无法跨窗口共享。
 *
 * key 为文章路径，value 为已渲染的 HTML。
 */
const snapshotCache = new Map<string, string>()

export function getArticleSnapshot(path: string): string {
  return snapshotCache.get(path) || ''
}

export function setArticleSnapshot(path: string, html: string) {
  if (html && html.trim())
    snapshotCache.set(path, html)
}
