/**
 * 与语言环境无关的格式化工具
 *
 * 不使用 `toLocaleDateString` / `toLocaleString`：SSG 在 Node 侧预渲染、
 * 浏览器侧水合，两端 ICU 数据与默认时区可能不同，会导致水合不一致。
 * 这里改用 Date 的本地时间分量手工拼接，输出与原先 zh-CN 的写法一致。
 */

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function toDate(value?: string | number | Date | null): Date | null {
  if (isEmpty(value))
    return null
  const date = value instanceof Date ? value : new Date(value as string | number)
  return Number.isNaN(date.getTime()) ? null : date
}

/** `2024年1月5日`；无法解析时原样返回 */
export function formatDate(value?: string | number | Date | null): string {
  if (isEmpty(value))
    return ''
  const date = toDate(value)
  if (!date)
    return String(value)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/** `1月5日`（归档列表用，不带年份） */
export function formatMonthDay(value?: string | number | Date | null): string {
  if (isEmpty(value))
    return ''
  const date = toDate(value)
  if (!date)
    return String(value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/** `2024/01/05 14:30`（文件列表用，补零便于对齐） */
export function formatDateTime(value?: string | number | Date | null): string {
  if (isEmpty(value))
    return ''
  const date = toDate(value)
  if (!date)
    return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 去掉 HTML 标签并去除首尾空白 */
export function stripHtml(input: unknown): string {
  return String(input || '').replace(/<[^>]*>/g, '').trim()
}

/** 文件体积：`512 B` / `1.2 KB` / `3.4 MB` */
export function formatSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
