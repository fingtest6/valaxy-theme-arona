# Valaxy Theme Arona

[![npm](https://img.shields.io/npm/v/valaxy-theme-arona)](https://github.com/fingtest6/valaxy-theme-arona)
[![npm dev dependency version](https://img.shields.io/npm/dependency-version/valaxy-theme-starter/dev/valaxy)](https://github.com/YunYouJun/valaxy)

[在线预览](https://arona.demo.cjhcjh6.top/)

> [!WARNING]
> Valaxy Theme Arona 目前仍在开发中，请谨慎用于生产环境。

## ✨ 功能特性

## 📦 安装

### 1. 安装主题

```shell
pnpm add valaxy-theme-arona
```

### 2. 启用主题

在 `valaxy.config.ts` 中设置 `theme: 'arona'`：

```ts
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'arona',
})
```

### 3. 配置主题

```ts
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'arona',
  themeConfig: {
    // 文章默认显示模式：'fullscreen' | 'window'
    articleDisplayMode: 'fullscreen',
    // 窗口标题栏默认样式：'mac' | 'windows'
    windowStyle: 'mac',
    // 是否启用浏览器彩蛋
    browserEasterEgg: true,

    // 友情链接设置
    friends: [
      {
        name: 'Valaxy',
        link: 'https://valaxy.site',
        avatar: 'https://valaxy.site/valaxy-logo.png',
        description: 'Next Generation Static Blog Framework.',
      },
      {
        name: 'Vue.js',
        link: 'https://cn.vuejs.org',
        avatar: 'https://cn.vuejs.org/logo.svg',
        description: '渐进式 JavaScript 框架',
      },
      {
        name: 'Vite',
        link: 'https://cn.vitejs.dev',
        avatar: 'https://cn.vitejs.dev/logo.svg',
        description: '下一代前端构建工具',
      },
    ],

    // 壁纸设置
    wallpaper: {
      blur: false,
    },

    // 页脚设置
    footer: {
      since: 2025,
    },
  },
})
```

> 提示：`themeConfig` 也可以写在 `site.config.ts` 中，`valaxy.config.ts` 中的配置优先级更高。

## ⚙️ 配置项

| 配置项               | 类型                       | 默认值         | 说明                       |
| -------------------- | -------------------------- | -------------- | -------------------------- |
| `articleDisplayMode` | `'fullscreen' \| 'window'` | `'fullscreen'` | 文章显示模式               |
| `windowStyle`        | `'mac' \| 'windows'`       | `'mac'`        | 窗口标题栏样式             |
| `browserEasterEgg`   | `boolean`                  | `true`         | 是否启用浏览器彩蛋         |
| `friends`            | `FriendItem[]`             | `[]`           | 友情链接列表               |
| `wallpaper.light`    | `string`                   | 内置亮色壁纸   | 亮色模式壁纸               |
| `wallpaper.dark`     | `string`                   | 内置暗色壁纸   | 暗色模式壁纸               |
| `wallpaper.blur`     | `boolean`                  | `false`        | 是否模糊壁纸               |
| `footer.since`       | `number`                   | `2024`         | 页脚起始年份               |
| `footer.powered`     | `boolean`                  | `true`         | 是否显示 Powered by Valaxy |
| `walineServerURL`    | `string`                   | `''`           | Waline 服务端地址          |

## 🚀 本地开发

```shell
# 安装依赖
pnpm install

# 启动 demo 预览
pnpm dev

# 构建 demo
pnpm build
```

## ✅ TODO

- [x] 评论
- [x] 个性化更改
- [x] 黑暗主题适配
- [x] 文章页面的透明效果
- [x] 友情链接页面
- [x] 搜索功能
- [x] 图标
- [x] Tag 以及其他文章标签修复
- [x] 切换 Windows 的窗口样式
- [x] 浏览器彩蛋
- [x] 编写安装方法
- [ ] 添加阿罗娜 spine

## 🙏 感谢

- [Valaxy](https://github.com/YunYouJun/valaxy)
- [valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter)
