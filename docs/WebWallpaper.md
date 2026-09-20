## 网页壁纸额外的配置项

> 此部分由AI生成

| 字段          | 类型               | 默认值              | 说明                                                                                     |
| ------------- | ------------------ | ------------------- | ---------------------------------------------------------------------------------------- |
| `enable`      | `boolean`          | `false`             | 是否启用网页壁纸                                                                         |
| `url`         | `string`           | `/<dir>/index.html` | iframe 地址，站内路径会拼接 Vite `base`                                                  |
| `dir`         | `string` / `false` | `'wallpaper'`       | 资源目录（相对项目根目录）；`false` 表示不复制，适用于外部 URL 或放在 `public/` 中的资源 |
| `mobile`      | `boolean`          | `false`             | 移动端是否加载（WebGL 等重资源建议关闭）                                                 |
| `idleTimeout` | `number`           | `1500`              | 首屏渲染后等待空闲挂载的最长时间（ms）                                                   |
| `cache`       | `boolean`          | `false`             | 生产环境生成 Service Worker 并缓存壁纸资源，二次访问秒开                                 |
| `interactive` | `boolean`          | `true`              | 是否允许鼠标与网页壁纸交互；默认开启，桌面窗口仍可正常操作                               |

### 构建行为

- `enable: false`：`wallpaper/` 不会被复制到 `dist`，也不会生成 Service Worker。
- `enable: true`：构建后输出到 `dist/<dir>/`；开发环境通过中间件直接访问。
- 网页壁纸不会出现在 SSG 静态 HTML 中，而是在首屏渲染完成后空闲挂载，并使用原有静态图片作为海报兜底。
- `cache: true` 时仅对同源、本地目录壁纸生效，Service Worker 作用域限定在壁纸目录内。

### 运行时开关与性能检测

- 右上角菜单栏的设置按钮左侧、设置应用的「网页壁纸」分组中都可以开关网页壁纸。
- 首次开启且没有手动设置时，会在网页壁纸挂载后采样帧率；若平均 FPS 低于 30 或长帧比例过高，会自动关闭网页壁纸并弹出提示。
- 提示窗口支持勾选「不再弹出此提示」；提示只是建议，随时可以再通过开关重新开启网页壁纸。
- 开关状态会记录在浏览器 localStorage 中，下一次访问会沿用你的选择。

### 性能建议

- 保持默认的海报兜底 + 空闲挂载方案，避免大体积 WebGL 资源阻塞首屏。
- 开启 `cache: true` 后，浏览器首次加载仍会下载完整资源，之后由 Cache Storage 直接命中。
- 部署时建议为 `wallpaper/**` 配置长期缓存或开启 Brotli/Gzip；Unity WebGL 的 `.data`、`.wasm` 通常体积较大。
- 外部 URL 需要目标站点允许 iframe 嵌入（未设置 `X-Frame-Options: DENY` / CSP `frame-ancestors`），否则会被浏览器拦截。
