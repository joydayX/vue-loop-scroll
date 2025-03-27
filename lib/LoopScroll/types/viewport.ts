import type { MarginInfo } from ".";

/**
 * 视口锚点分析结果
 * @template T - 原始数据项类型
 */
export type ViewportAnchorResult<T> =
  | {
      status: "found";
      item: T;
      index: number;
      margins: MarginInfo;
    }
  | {
      status: "not-found";
    };
