// 虚拟模块由 theme/node/apps.ts 生成，类型直接复用公开类型，避免两处定义漂移。
//
// 注意：这里必须使用内联 `import()` 类型。一旦出现顶层 import，
// 本文件会变成模块，`declare module` 将退化为模块增强并静默失效
// （skipLibCheck 会隐藏该错误，只在消费方表现为 "Cannot find module"）。

declare module 'virtual:arona/notes' {
  const notes: import('./index').NoteItem[]
  export default notes
}

declare module 'virtual:arona/album' {
  const album: import('./index').AlbumData
  export default album
}

declare module 'virtual:arona/files' {
  const files: import('./index').FilesData
  export default files
}
