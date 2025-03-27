/**
 * 列表项布局信息
 */
export type ItemPositions = {
  /**​ 数据项唯一键 */
  key: string;
  /**​ DOM 唯一标识 */
  uid: string;
  /**​ 项宽度（像素） */
  width: number;
  /**​ 项高度（像素） */
  height: number;
  /**​ 顶部位置（像素） */
  top: number;
  /**​ 底部位置（像素） */
  bottom: number;
  /**​ 左侧位置（像素） */
  left: number;
  /**​ 右侧位置（像素） */
  right: number;
}[];

/**
 * 边距计算结果
 */
export interface MarginInfo {
  /**​ 项前剩余空间（像素） */
  marginBefore: number;
  /**​ 项后剩余空间（像素） */
  marginAfter: number;
}
