/**
 * 按指定方向遍历数组并执行回调
 * @param items - 待遍历的数组
 * @param callback - 遍历回调函数（参数：当前元素，元素索引）
 * @param direction - 遍历方向（forward: 正序，reverse: 逆序）
 * @template K - 数组元素类型
 */
export const traverseArray = <K>(
  items: K[], // 原参数名 arr → items
  callback: (item: K, index: number) => void,
  direction: "forward" | "reverse" = "forward",
) => {
  const maxIndex = items.length - 1;
  let currentIndex = 0;

  if (direction === "forward") {
    while (currentIndex <= maxIndex) {
      callback(items[currentIndex], currentIndex);
      currentIndex++;
    }
  } else {
    let reverseIndex = maxIndex;
    while (reverseIndex >= 0) {
      callback(items[reverseIndex], reverseIndex);
      reverseIndex--;
    }
  }
};
