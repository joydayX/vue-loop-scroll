/**
 * 滚动列表渲染项数据格式
 * @template T - 原始数据项类型
 */
interface ScrollItem<T> {
  /**​ 原始数据值 */
  value: T;
  /**​ 渲染项唯一键（基于数据项生成） */
  key: string;
  /**​ DOM 层唯一标识（用于虚拟滚动） */
  uid: string;
}

/**
 * 滚动列表渲染数据集
 * @template T - 原始数据项类型
 */
export type ScrollItems<T> = ScrollItem<T>[];
