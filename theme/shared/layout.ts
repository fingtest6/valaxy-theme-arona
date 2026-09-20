/**
 * 桌面布局常量
 *
 * SCSS 无法直接引用 TS 常量，`theme/styles/css-vars.scss` 中的
 * `--st-menubar-h` / `--st-dock-h` 必须与这里的值保持一致。
 */

/** 菜单栏高度，对应 `--st-menubar-h` */
export const MENUBAR_HEIGHT = 30

/** Dock 高度，对应 `--st-dock-h` */
export const DOCK_HEIGHT = 84

/** 移动端断点，与 useIsMobile 的 media query 保持一致 */
export const MOBILE_BREAKPOINT = 768

/** 窗口可缩放的最小尺寸 */
export const WINDOW_MIN_WIDTH = 360
export const WINDOW_MIN_HEIGHT = 280

/** 默认强调色，与 vars.scss 的 $light 'c-brand' 保持一致 */
export const ST_DEFAULT_ACCENT = '#0078E7'
