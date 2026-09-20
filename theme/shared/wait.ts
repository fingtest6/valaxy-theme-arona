/**
 * 等待指定毫秒数
 *
 * 客户端与服务端构建脚本共用（WebWallpaper.vue / composables/webWallpaper.ts）。
 */
export function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}
