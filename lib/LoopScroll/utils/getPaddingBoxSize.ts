/**
 * 获取元素内容区域尺寸（包含内边距，排除边框）
 * @param {HTMLElement} element
 * @returns { {width: number, height: number} }
 */
export function getPaddingBoxSize(element: HTMLElement | null) {
  if (!element?.offsetParent) return { width: 0, height: 0 };

  // 获取元素完整尺寸（包含边框）
  const rect = element.getBoundingClientRect();

  // 获取计算样式（用于提取边框宽度）
  const computedStyle = window.getComputedStyle(element);

  // 解析边框宽度（处理 NaN 情况）
  const parseBorder = (width: string) => parseFloat(width) || 0;
  const borderX =
    parseBorder(computedStyle.borderLeftWidth) +
    parseBorder(computedStyle.borderRightWidth);
  const borderY =
    parseBorder(computedStyle.borderTopWidth) +
    parseBorder(computedStyle.borderBottomWidth);

  return {
    width: rect.width - borderX, // 宽度 = 总宽度 - 左右边框
    height: rect.height - borderY, // 高度 = 总高度 - 上下边框
  };
}
