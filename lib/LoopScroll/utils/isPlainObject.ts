/**
 * 判断是否是对象
 * @param {any} value - 要检查的值
 * @returns {boolean} - 返回是否是对象
 */
export function isPlainObject(value: any): value is Record<string, any> {
    const type = typeof value;
    return value != null && type === "object";
  }
  