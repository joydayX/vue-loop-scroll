/**
 * 生成自增的唯一ID字符串（从0开始计数）
 * @returns {string} 格式如 "0", "1", "2"...
 */

let uid = 0;
export const generateUniqueId = () => String(uid++);
