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
    // Waline 评论服务地址
    walineServerURL: 'xxx.xxx.xxx',
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
- [ ] 添加阿罗娜 spine

## 🙏 感谢

- [Valaxy](https://github.com/YunYouJun/valaxy)
- [valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter)
