# Valaxy Theme Arona

[![npm](https://img.shields.io/npm/v/valaxy-theme-arona)](https://github.com/fingtest6/valaxy-theme-arona)
[![npm dev dependency version](https://img.shields.io/npm/dependency-version/valaxy-theme-starter/dev/valaxy)](https://github.com/YunYouJun/valaxy)

[在线预览](https://arona.demo.cjhcjh6.top/)

> Valaxy Theme Arona 目前仍在开发中,部分代码使用AI生成
>
> 如有问题前往issues反馈

## 安装

### 1. 安装主题

```shell
pnpm add valaxy-theme-arona
```

也可以通过创建 Valaxy 项目来安装

```shell
pnpm create valaxy
```

### 2. 启用主题

在 `valaxy.config.ts` 中设置 `theme: 'arona'`：

```ts
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'arona',
})
```

### 3. 配置主题

在`valaxy.config.ts` 的`themeConfig: {}`粘贴下面的themeConfig配置

```ts
export default defineValaxyConfig({
  // site config see site.config.ts

  theme: 'arona',

  themeConfig: {
    // 部分App开关  文件 笔记 相册
    apps: {
      files: true,
      notes: true,
      album: true,
    },
    // Waline 评论服务地址,没有启用评论不用填写
    walineServerURL: 'xxx.xxx.xxx',
    // 友情链接描述
    friendsDescription: '这里是友链',
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
      // 静态图片兜底（网页壁纸加载前显示）
      blur: false,
      // 网页壁纸
      web: {
        // 启用网页壁纸
        enable: false,
        // 生产环境注册 Service Worker，二次访问秒开
        cache: true,
        // 网页壁纸交互
        interactive: true,
      },
    },

    // 页脚设置
    footer: {
      since: 2025,
    },
  }, // 复制到这里

  unocss: { safelist },
})
```

## 其他APP

```ts
export default defineValaxyConfig({
// site config see site.config.ts

  theme: 'arona',

  themeConfig: {
    // 部分App开关
    apps: {
      files: true, // 文件
      notes: true, // 笔记
      album: true, // 相册
    },
  },
  unocss: { safelist },
})
```

### 相册配置

将图片放在项目根目录的 `photos`里并创建一个 `index.md`

```txt
your-site/
├── public/
└── photos/
    ├── index.md
    └──...
```

index.md的内容为

### 示例

```txt
---
title: 相册
description: 这里记录一些喜欢的画面。
photos:
  - src: AronaRoom.webp
    title: 什亭之匣-白天
    description: 白天的什亭之匣，光线很温柔。
  - src: AronaRoom_Night.webp
    title: 什亭之匣-夜晚
    description: 夜晚的什亭之匣，安静又治愈。
  - src: https://imgbed.rduteam.top/file/17897578412f14.webp
    title: 秋天
    description: 秋天,树叶落地。
---
```

支持本地图片与网络图片

## 网页壁纸

主题支持将网页 / WebGL 应用作为桌面壁纸，网页壁纸目录不会被 Valaxy 默认输出，可以安全地按需启用。

### 存放目录

将网页壁纸资源放在项目根目录的 `wallpaper`(需要手动创建) 中（与 `public` 同级，不要放进 `public.`）

```txt
your-site/
├── public/
└── wallpaper/
    ├── index.html
    └── ...
```

### 启用

在 `valaxy.config.ts` 的 `themeConfig.wallpaper` 中配置`enable: false`改为`enable: true`

```ts
import type { ThemeConfig } from 'valaxy-theme-arona'
import { defineConfig } from 'valaxy'

export default defineConfig<ThemeConfig>({
  theme: 'arona',
  themeConfig: {
    wallpaper: {
      blur: false,
      web: {
        // 启用网页壁纸  这里改为true
        enable: true,
        // 生产环境注册 Service Worker，二次访问秒开
        cache: true,
        // 网页壁纸交互
        interactive: true,
      },
    },
  },
})
```

额外的配置项[查看](docs/WebWallpaper.md)

## 本地开发

```shell
# 安装依赖
pnpm install

# 启动 demo 预览
pnpm dev

# 构建 demo
pnpm build
```

## TODO

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
- [x] 网页壁纸支持
- [ ] 添加阿罗娜 spine

## 🙏 感谢

- [Valaxy](https://github.com/YunYouJun/valaxy)
- [valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter)
