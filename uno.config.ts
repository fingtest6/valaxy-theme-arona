// 本文件供 ESLint 的 UnoCSS 规则（@unocss/eslint-plugin）解析类名顺序使用。
//
// 注意：Valaxy 只在 themeRoot / clientRoot 下查找 uno.config.ts，
// 不会读取工作区根目录的这一份；运行时样式由 Valaxy 内置的 UnoCSS 配置
// （presetWind4 / presetAttributify / presetIcons / presetTypography）提供。
// 因此这里不要引入与 Valaxy 默认预设冲突的配置。
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
