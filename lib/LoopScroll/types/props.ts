/**
 * 尺寸对象
 * @remarks 用于描述组件的高度和宽度
 */
export type Size = {
  height: number;
  width: number;
};

/**
 * 滚动列表组件属性配置
 * @template T - 数据项类型
 * @template K - 数据项唯一键字段类型（可选）
 */
export interface ScrollProps<T, K extends keyof T> {
  /**​
   * 原始数据源
   * @example
   * [{ id: 1, text: "Item1" }, { id: 2, text: "Item2" }]
   */
  dataSource: T[];

  /**​
   * 数据项唯一标识字段名
   * @defaultValue "id"
   */
  itemKey?: K;

  /**​
   * 滚动方向
   * @defaultValue "up"
   */
  direction?: "up" | "down" | "left" | "right";

  /**​
   * 滚动速度系数（像素/帧）
   * @remarks 值越大滚动越快
   * @defaultValue 1
   */
  speed?: number;

  /**​
   * 滚动暂停时间（毫秒）
   * @defaultValue 0（不暂停）
   */
  waitTime?: number;

  /**​
   * 是否启用悬停暂停
   * @defaultValue true
   */
  pausedOnHover?: boolean;

  /**​
   * 批量加载数据量
   * @remarks 影响滚动平滑度和性能
   * @defaultValue 10
   */
  loadCount?: number;
}
