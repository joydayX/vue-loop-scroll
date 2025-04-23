<script setup lang="ts" generic="T, K extends keyof T">
import {
  computed,
  onMounted,
  reactive,
  ref,
  shallowRef,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useCancellableTask, useForceUpdate, useResizeObserver } from "./hooks";
import {
  getPaddingBoxSize,
  generateUniqueId,
  traverseArray,
  isPlainObject,
  type DelayTaskPromise,
  createDelayTask,
  cancelDelayTask,
} from "./utils";
import type {
  ScrollProps,
  ScrollItems,
  ItemPositions,
  MarginInfo,
  ViewportAnchorResult,
} from "./types";

/* -------------------------------- Props -------------------------------- */
const props = withDefaults(defineProps<ScrollProps<T, K>>(), {
  direction: "up", // 滚动方向, 可选值: "up" | "down" | "left" | "right"
  speed: 1, // 滚动速度, 初始值: 1
  waitMode: "item", // 控制滚动后是否暂停的模式, 可选值: "item" | "page"
  waitTime: 0, // 等待时间, 初始值: 0
  pausedOnHover: true, // 鼠标悬停时暂停, 初始值: true
  loadCount: 1, // 加载数量, 初始值: 1
});

/* -------------------------------- DOM 引用 -------------------------------- */
/** 可视区域内容 DOM 元素引用 */
const scrollViewportRef = ref<HTMLElement | null>(null);
/** 滚动内容区域 DOM 元素引用 */
const scrollTrackRef = ref<HTMLElement | null>(null);

/* ------------------------------ 状态 ------------------------------ */
/** 实际渲染的列表数据 */
const scrollItems = shallowRef<ScrollItems<T>>([]);

/** 延迟等待 Promise 实例 */
let delayTaskPromise: DelayTaskPromise | null;

/** 动画帧请求 ID（用于取消滚动动画） */
let animationFrameId: number | undefined;

/** 所有列表项的尺寸位置信息 */
let itemPositions: ItemPositions = [];

/* 滚动容器尺寸度量 */
const scrollMetrics = reactive({
  viewportWidth: 0,
  viewportHeight: 0,
  trackWidth: 0,
  trackHeight: 0,
});

/** 初始化滚动状态 */
const initState = {
  scrollOffset: 0, // 当前滚动偏移量（像素）
  scrollOffsetInPageMode: 0, // page 模式下的滚动量
  isScrolling: false, // 滚动动画状态标识
  isPaused: false, // 是否暂停
};

/** 响应式滚动状态 */
const state = reactive({ ...initState });

/** 重置滚动状态至初始值 */
const resetState = () => {
  Object.assign(state, { ...initState });
};

/* ------------------------------ 计算属性 ------------------------------ */
/** 判断是否为垂直滚动模式（方向为上/下时返回 true） */
const isVertical = computed(() => ["up", "down"].includes(props.direction));

/** 判断是否为前进方向滚动（方向为上/左时返回 true） */
const isForward = computed(() => ["up", "left"].includes(props.direction));

/** 当前视口尺寸（垂直模式取高度，水平模式取宽度） */
const viewportSize = computed(() =>
  isVertical.value ? scrollMetrics.viewportHeight : scrollMetrics.viewportWidth,
);

/** 滚动内容总尺寸（垂直模式取总高度，水平模式取总宽度） */
const trackSize = computed(() =>
  isVertical.value ? scrollMetrics.trackHeight : scrollMetrics.trackWidth,
);

/** 判断是否允许滚动 */
const isScrollable = computed(() => trackSize.value > viewportSize.value);

/** 动态计算的平移样式*/
const transformStyle = computed(() => {
  let scrollOffset = state.scrollOffset;
  if (isForward.value) {
    scrollOffset *= -1;
  } else {
    scrollOffset += viewportSize.value - trackSize.value;
  }
  const translate = isVertical.value
    ? `0, ${scrollOffset}px, 0`
    : `${scrollOffset}px, 0, 0`;
  return { transform: `translate3D(${translate})` };
});

/** 判断是否需要暂停滚动 */
const shouldPause = computed(() => props.waitTime > 0);

/* 计算当前帧的滚动量，范围从最小正数到视口大小（viewportSize）*/
const frameOffset = computed(() =>
  Math.max(Math.min(props.speed, viewportSize.value), Number.MIN_VALUE),
);

/* ------------------------------ hook ------------------------------ */
/** 带取消功能的 nextTick */
const {
  execute: executeNextTick,
  cancel: cancelNextTick,
  isCancellable: isNextTickCancellable,
  isCancelledError: isNextTickCancelledError,
} = useCancellableTask(nextTick);

const { updateCounter, triggerUpdate } = useForceUpdate();

/* ------------------------------ 函数 ------------------------------ */
/** 计算滚动内容区域的实际渲染尺寸 */
const getScrollTrackSize = () => {
  const scrollContent = scrollTrackRef.value;
  if (!scrollContent) return 0;
  const { height, width } = getPaddingBoxSize(scrollTrackRef.value);
  return isVertical.value ? height : width;
};

/** 获取最后一项的 key 值 */
const getLastItemKey = () => {
  const lastItem = itemPositions[itemPositions.length - 1];
  return lastItem?.key ?? "";
};

/** 处理鼠标进入滚动区域的事件 */
const mouseenter = () => {
  if (props.pausedOnHover && !state.isPaused && state.isScrolling) {
    state.isPaused = true;
    stopAllEffects();
  }
};

/** 处理鼠标离开滚动区域的事件 */
const mouseleave = () => {
  if (props.pausedOnHover && state.isPaused && state.isScrolling) {
    state.isPaused = false;
    startScrollAnimation(delayTaskPromise?.isRunning);
  }
};

/** 执行等待延迟 */
const startDelayedWait = async () => {
  delayTaskPromise = createDelayTask(props.waitTime);
  const cancelled = await delayTaskPromise;
  return cancelled;
};

/** 取消等待延迟 */
const cancelDelayedWait = () => {
  if (delayTaskPromise?.isRunning) {
    cancelDelayTask(delayTaskPromise);
    delayTaskPromise = null;
  }
};

/**
 * 提取数据项的唯一标识键
 * @param item - 待处理的数据项
 * @returns 唯一标识字符串（优先使用 itemKey 配置项，其次尝试序列化整个对象）
 * @throws 当数据项序列化失败时返回空字符串
 */
const getItemKey = (item: T): string => {
  try {
    if (isPlainObject(item) && props.itemKey && item[props.itemKey] != null) {
      return String(item[props.itemKey]);
    }
    return JSON.stringify(item);
  } catch (_e) {
    return "";
  }
};

/**
 * 将数据项转换为滚动项数据结构
 * @param item - 原始数据项
 * @returns 包含唯一标识和原始值的滚动项对象
 */
const createScrollItem = (item: T) => ({
  value: item,
  uid: generateUniqueId(),
  key: getItemKey(item),
});

/**
 * 获取 "滚动内容区域" 的所有子元素
 * @returns 子元素数组（空数组表示无子元素或容器未挂载）
 */
const getTrackChildren = () =>
  Array.from(scrollTrackRef.value?.children ?? []) as HTMLElement[];

/**
 * 计算所有列表项的总尺寸
 * @param itemPositions - 列表项位置信息集合
 * @returns 包含总宽度和总高度的对象
 */
const calculateItemsTotalSize = (positions: ItemPositions) => {
  const { totalWidth, totalHeight } = positions.reduce(
    (total, position) => {
      total.totalHeight += position.height;
      total.totalWidth += position.width;
      return total;
    },
    { totalWidth: 0, totalHeight: 0 },
  );
  return isVertical.value ? totalHeight : totalWidth;
};

/** 获取 "可视区域内容" 尺寸 */
const getViewportSize = () => getPaddingBoxSize(scrollViewportRef.value);

/** 获取 "滚动内容区域" 尺寸 */
const getTrackSize = () => getPaddingBoxSize(scrollTrackRef.value);

/**
 * 更新滚动容器尺寸度量
 *
 * 使用 getPaddingBoxSize 函数获得尺寸的原因：
 *    - getPaddingBoxSize 函数内部是使用 getBoundingClientRect() 方法获取元素的尺寸信息，
 *    - 为什么不直接使用 clientHeight/clientWidth 属性，
 *      因为 useResizeObserver 监听容器得到的是精确的数值(带小数的)，
 *      为了减少 useResizeObserver 里的回调函数频繁执行，所以使用 getPaddingBoxSize 来获取元素的尺寸信息。
 */
const updateContainerMetrics = () => {
  const viewportSize = getViewportSize();
  const trackSize = getTrackSize();

  Object.assign(scrollMetrics, {
    viewportHeight: viewportSize.height,
    viewportWidth: viewportSize.width,
    trackHeight: trackSize.height,
    trackWidth: trackSize.width,
  });
};

/**
 * 通过唯一键查找数据项索引
 * @param key - 要查找的数据项唯一键
 * @returns 匹配项的索引，未找到返回 -1
 */
const findIndexByKey = (key: string) =>
  props.dataSource.findIndex((item) => getItemKey(item) === key);

/**
 * 更新所有滚动项的位置缓存
 * @param domNodes - 当前渲染的DOM节点数组
 */
const updateItemPositions = (domNodes: HTMLElement[]) => {
  itemPositions = calculateItemPositions(domNodes);
};

/** 停止当前滚动动画 */
const stopScrollAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = undefined;
  }
};

/**
 * 停止所有滚动副作用
 * @description
 * 1. 停止当前滚动动画
 * 2. 取消延迟等待
 */
const stopAllEffects = () => {
  stopScrollAnimation(); // 停止当前动画
  cancelDelayedWait(); // 取消延迟等待
};

/** 重置所有滚动相关状态 */
const resetScrollState = () => {
  stopAllEffects(); // 停止所有动画效果
  resetState(); // 重置滚动状态
  itemPositions = []; // 清空位置缓存
};

/**
 * 计算所有滚动项的位置信息
 * @param nodes - 滚动项DOM节点数组
 * @returns 包含所有项位置信息的数组
 * @description
 * 1. 根据滚动方向计算每个节点的边界坐标
 * 2. 基于前序节点的位置进行相对定位
 * 3. 支持正向/反向两种布局方向
 */
const calculateItemPositions = (domNodes: HTMLElement[]) => {
  const itemPositions: ItemPositions = [];
  const scrollTrack = scrollTrackRef.value;
  if (!scrollTrack) return itemPositions;

  const scrollTrackSize = getScrollTrackSize();

  // 跟踪前序节点的布局位置
  let previousNodePosition: { bottom: number; right: number } | undefined;

  // 获取内容容器的基准坐标
  const { top: scrollContentTop, left: scrollContentLeft } =
    scrollTrack.getBoundingClientRect();

  /**
   * 计算节点的最终边界坐标（根据滚动方向适配）
   * @param nodeRect - DOM节点的边界矩形
   * @returns 适配后的底部和右侧坐标
   */
  const calculateNodeBoundary = (nodeRect: DOMRect) => {
    const bottom = isForward.value
      ? nodeRect.bottom - scrollContentTop
      : scrollTrackSize - (nodeRect.top - scrollContentTop);

    const right = isForward.value
      ? nodeRect.right - scrollContentLeft
      : scrollTrackSize - (nodeRect.left - scrollContentLeft);

    return { bottom, right };
  };

  /**
   * 获取前序节点的布局信息
   * @param currentNode - 当前处理节点
   * @returns 前序节点的底部和右侧坐标
   */
  const getPreviousNodeBoundary = (currentNode: HTMLElement) => {
    // 根据布局方向获取相邻节点
    const adjacentNode = isForward.value
      ? currentNode.previousElementSibling
      : currentNode.nextElementSibling;

    if (!adjacentNode) return { bottom: 0, right: 0 };

    return calculateNodeBoundary(adjacentNode.getBoundingClientRect());
  };

  traverseArray(
    domNodes,
    (currentNode) => {
      const nodeRect = currentNode.getBoundingClientRect();

      // 获取当前节点的起始坐标（基于前序节点或容器边缘）
      let { bottom: baseBottom, right: baseRight } =
        previousNodePosition ?? getPreviousNodeBoundary(currentNode);

      // 计算当前节点的布局参数
      const top = baseBottom;
      const left = baseRight;
      const { bottom, right } = calculateNodeBoundary(nodeRect);
      const height = bottom - top;
      const width = right - left;

      // 更新前序节点记录
      previousNodePosition = {
        bottom,
        right,
      };

      itemPositions.push({
        uid: currentNode.dataset.uid || "",
        key: currentNode.dataset.key || "",
        width,
        height,
        top,
        bottom,
        left,
        right,
      });
    },
    isForward.value ? "forward" : "reverse",
  );

  return itemPositions;
};

/**
 * 批量加载滚动数据项
 * @param startIndex - 起始加载索引
 * @param requiredSize - 需要填充的视图区域尺寸
 * @param loadDirection - 加载方向（next: 向后加载，pre: 向前加载）
 * @description 实现特性：
 * 1. 循环列表支持
 * 2. 动态加载数量预测
 */
const loadDataBatch = async (
  startIndex: number,
  requiredSize: number,
  loadDirection: "next" | "pre",
) => {
  const totalListData = props.dataSource.length;
  const scrollItemsLength = scrollItems.value.length;
  const isNextDirection = loadDirection === "next";

  let retryCounter = 0;
  const MAX_ERROR_RETRY = props.dataSource.length * 2;

  const loadUntilFilled = async () => {
    // 按照目前页面的算法，最多加载的次数不会超过 "最大长度 * 2";
    // 也是为了防止异常, 造成死循环
    if (retryCounter++ > MAX_ERROR_RETRY) return;

    let remainingLoads = props.loadCount;
    const loadedItems: ScrollItems<T> = [];

    while (remainingLoads-- > 0) {
      // 处理循环列表索引
      startIndex = (startIndex + totalListData) % totalListData;

      const insertionMethod = isForward.value ? "push" : "unshift";
      loadedItems[insertionMethod](
        createScrollItem(props.dataSource[startIndex]),
      );

      isNextDirection ? startIndex++ : startIndex--;
    }

    const isAppendDirection =
      (isForward.value && isNextDirection) ||
      (!isForward.value && !isNextDirection);

    scrollItems.value = isAppendDirection
      ? scrollItems.value.concat(loadedItems)
      : loadedItems.concat(scrollItems.value);

    // 等待DOM更新后计算新项位置
    await executeNextTick();

    // 获取新增的DOM节点
    const newDOMNodes = isAppendDirection
      ? getTrackChildren().slice(scrollItemsLength)
      : getTrackChildren().slice(
          0,
          scrollItems.value.length - scrollItemsLength,
        );

    // 计算新增项的总尺寸
    const newPositions = calculateItemPositions(newDOMNodes);
    const actualLoadedSize = calculateItemsTotalSize(newPositions);

    // 递归加载直到满足尺寸需求
    if (newDOMNodes.length > 0 && requiredSize > actualLoadedSize) {
      await loadUntilFilled();
    } else {
      updateItemPositions(getTrackChildren());
      updateContainerMetrics();
    }
  };

  await loadUntilFilled();
};

/**
 * 启动滚动动画主流程
 * @description 核心动画调度器，包含三个阶段：
 * 1. 初始暂停阶段（可选）：根据配置进行启动前等待
 * 2. 动画循环阶段：持续执行滚动步骤直到终止条件
 * 3. 边界处理阶段：检测并处理滚动越界情况
 *
 * @param initialPause - 是否启用初始暂停阶段
 * @throws 当动画被外部中断时抛出取消错误
 */

const startScrollAnimation = async (initialPause = true) => {
  // 设置为正在滚动的状态
  state.isScrolling = true;

  // 如果当前处于暂停状态，直接返回
  if (state.isPaused) return;

  /**
   * 查找下一个滚动基准项
   * 通过计算当前滚动量与项的尺寸来判断是否越过了某个项的边界。
   * @param scrollAmount - 当前滚动量
   * @param startIndex - 起始查找索引
   * @returns 包含越界信息和下一个基准项的元数据
   */
  const findNextScrollPosition = (scrollAmount: number, startIndex: number) => {
    const totalItems = itemPositions.length;
    const getItemDimension = (item: ItemPositions[number]) =>
      isVertical.value ? item.height : item.width; // 获取项的尺寸，根据方向判断宽高

    let currentIndex = startIndex; // 当前项的索引
    let accumulatedSize = 0; // 累积的尺寸
    let retryCounter = 0; // 防止死循环的重试计数器
    const MAX_ERROR_RETRY = props.dataSource.length; // 最大重试次数，防止死循环

    while (true) {
      // 防止异常或死循环，超过最大重试次数则退出
      if (retryCounter++ > MAX_ERROR_RETRY) {
        break;
      }

      const currentItemSize = getItemDimension(itemPositions[currentIndex]);
      accumulatedSize += currentItemSize; // 累加当前项的尺寸

      const nextIndex = (currentIndex + 1) % totalItems; // 下一个项的索引，循环获取

      const nextItemThreshold =
        accumulatedSize + getItemDimension(itemPositions[nextIndex]); // 下一个项的阈值

      // 判断当前滚动量是否已越界
      if (scrollAmount < accumulatedSize) {
        break; // 如果滚动量小于当前项的累计尺寸，退出循环
      } else if (scrollAmount < nextItemThreshold) {
        // 如果滚动量介于当前项与下一个项之间，返回下一个项的信息
        return {
          hasCrossedItem: true,
          nextItemIndex: nextIndex,
          remainingOffset: scrollAmount - accumulatedSize, // 返回剩余的偏移量
        };
      }

      currentIndex = nextIndex; // 更新当前项的索引
    }

    // 如果没有越界，返回初始项和剩余的滚动量
    return {
      hasCrossedItem: false,
      nextItemIndex: startIndex,
      remainingOffset: scrollAmount,
    };
  };

  // 初始状态下，通过滚动偏移量获取下一个滚动基准项
  let { remainingOffset: accumulatedOffset, nextItemIndex: currentItemIndex } =
    findNextScrollPosition(state.scrollOffset, 0);

  /**
   * 执行单步滚动动画
   * 该函数会执行一次滚动操作并更新相关状态
   */
  const performScrollStep = async () => {
    // 更新当前的滚动偏移量
    state.scrollOffset += frameOffset.value;
    accumulatedOffset += frameOffset.value;
    state.scrollOffsetInPageMode += frameOffset.value;

    // 检测是否越过了某个项的边界，返回是否越界、剩余偏移量和下一个项的索引
    const { hasCrossedItem, remainingOffset, nextItemIndex } =
      findNextScrollPosition(accumulatedOffset, currentItemIndex);

    if (hasCrossedItem) {
      // 更新当前项的索引和累计的偏移量
      currentItemIndex = nextItemIndex;
      accumulatedOffset = remainingOffset;

      // 判断是否需要调整项偏移（在“项模式”下）或页面偏移（在“页面模式”下）
      const shouldAdjustOffsetInItemMode =
        props.waitMode === "item" && shouldPause.value;
      const shouldAdjustOffsetInPageMode =
        props.waitMode === "page" &&
        shouldPause.value &&
        state.scrollOffsetInPageMode >= viewportSize.value;

      if (shouldAdjustOffsetInItemMode || shouldAdjustOffsetInPageMode) {
        // 如果需要调整偏移量，则回退
        accumulatedOffset -= remainingOffset;
        state.scrollOffset -= remainingOffset;
      }

      // 如果在“页面模式”下，调整页面的偏移量
      if (shouldAdjustOffsetInPageMode) {
        state.scrollOffsetInPageMode -= remainingOffset;
      }
    }

    // 如果当前滚动位置已经超过视口大小，开始处理视口之外的项
    if (state.scrollOffset >= viewportSize.value) {
      // 根据滚动方向决定移除的项
      const activeScrollItems = isForward.value
        ? scrollItems.value.slice(currentItemIndex) // 正向滚动：移除已滚出的项
        : scrollItems.value.slice(0, -currentItemIndex); // 反向滚动：截断末尾的项

      // 获取当前滚动项的位置信息
      const trackedItemPositions = itemPositions.slice(currentItemIndex);
      const trackedContentSize = calculateItemsTotalSize(trackedItemPositions);
      const bufferRequirement =
        viewportSize.value * 2 - (trackedContentSize - accumulatedOffset);

      // 如果需要预加载更多项，异步加载下一批数据
      if (bufferRequirement > 0) {
        scrollItems.value = activeScrollItems;
        itemPositions = trackedItemPositions;
        currentItemIndex = 0;
        state.scrollOffset = accumulatedOffset;

        const index = findIndexByKey(getLastItemKey());
        const lastLoadedIndex = index > -1 ? index + 1 : 0;
        await loadDataBatch(lastLoadedIndex, bufferRequirement, "next");
      }
    }

    // 判断是否需要在“项模式”或“页面模式”下暂停滚动，并调整位置
    const shouldPauseInItemMode =
      props.waitMode === "item" && hasCrossedItem && shouldPause.value;
    const shouldPauseInPageMode =
      props.waitMode === "page" &&
      hasCrossedItem &&
      state.scrollOffsetInPageMode >= viewportSize.value &&
      shouldPause.value;

    if (shouldPauseInPageMode) {
      // 如果是页面模式，滚动偏移量重置为0
      state.scrollOffsetInPageMode = 0;
    }

    // 如果需要暂停，则调用延迟等待函数，停止滚动直到等待完成
    if (shouldPauseInItemMode || shouldPauseInPageMode) {
      const cancelled = await startDelayedWait();
      if (cancelled) return;
    }

    // 请求下一帧进行滚动，并包裹成 Promise 以便捕获异常
    await new Promise<void>((resolve, reject) => {
      animationFrameId = requestAnimationFrame(async () => {
        try {
          // 递归调用滚动步骤，保持滚动流畅
          await performScrollStep();
          resolve();
        } catch (e: any) {
          reject(e); // 如果发生错误，捕获并拒绝 Promise
        }
      });
    });
  };

  // 如果需要初始等待且设置了暂停，则调用延迟等待函数
  if (shouldPause.value && initialPause) {
    const cancelled = await startDelayedWait(); // 启动延迟等待
    if (cancelled) return; // 如果等待被取消，则返回
  }

  // 执行单步滚动操作
  await performScrollStep();
};

/**
 * 校准滚动位置到指定项
 * @param targetItem - 需要对齐的目标项
 * @param referenceIndex - 参考索引位置
 * @param marginConfig - 前后边距配置
 * @param marginConfig.marginBefore - 目标项前保留空间
 * @param marginConfig.marginAfter - 目标项后保留空间
 */
const adjustScrollPosition = async (
  targetItem: T,
  referenceIndex: number,
  marginConfig: MarginInfo,
) => {
  // 创建临时定位项
  const scrollItem = createScrollItem(targetItem);
  scrollItems.value = [scrollItem];

  // 加载前后缓冲数据
  const { marginBefore, marginAfter } = marginConfig;
  if (marginBefore > 0) {
    await loadDataBatch(referenceIndex - 1, marginBefore, "pre");
  }
  if (marginAfter > 0) {
    await loadDataBatch(referenceIndex + 1, marginAfter, "next");
  }

  // 计算目标项定位位置
  const calculateAnchorPosition = () => {
    const position = itemPositions.find((item) => item.uid === scrollItem.uid);
    if (!position) return 0;
    return isVertical.value ? position.top : position.left;
  };

  const scrollOffset = calculateAnchorPosition() - marginBefore;

  // 应用校准后的滚动偏移
  state.scrollOffset = scrollOffset;
};

/**
 * 获取当前可视区域内的滚动项
 * @returns 可见项的位置信息数组
 * @remark 基于滚动偏移量计算可见范围
 */
const getVisibleViewportItems = () => {
  let remainingOffset = state.scrollOffset;
  const totalItems = itemPositions.length;
  const visibleItems: ItemPositions = [];
  let hasFoundStart = false;
  let currentIndex = 0;

  while (currentIndex < totalItems) {
    const currentItem = itemPositions[currentIndex];

    // 标记可见项起始点
    if (hasFoundStart) {
      visibleItems.push(currentItem);
    }

    // 计算项尺寸并更新剩余偏移量
    const itemSize = isVertical.value ? currentItem.height : currentItem.width;
    remainingOffset -= itemSize;

    // 确定首个可见项
    if (remainingOffset < 0) {
      if (hasFoundStart) {
        break;
      }
      visibleItems.push(currentItem);
      hasFoundStart = true;
      remainingOffset += viewportSize.value;
    }

    currentIndex++;

    // 循环列表处理
    if (currentIndex >= totalItems) {
      currentIndex = 0;
    }
  }

  return visibleItems;
};

/**
 * 计算项在视口中的边距空间
 * @param item 待分析的项位置信息
 * @returns 包含前后缓冲空间的尺寸信息
 */
const calculateItemMargins = (item: ItemPositions[number]): MarginInfo => {
  const itemSize = isVertical.value ? item.height : item.width;
  const basePosition = isVertical.value ? item.top : item.left;

  const marginBefore = basePosition - state.scrollOffset;
  const remainingSpace = viewportSize.value - marginBefore - itemSize;
  const marginAfter = remainingSpace + viewportSize.value; // 考虑反向滚动情况

  return {
    marginBefore,
    marginAfter,
  };
};

/**
 * 分析可视区域锚点项
 *
 * @description
 * 本函数执行以下核心操作：
 * 1. 获取当前视口内所有可见项的位置信息
 * 2. 遍历可见项，寻找与数据源匹配的有效数据项
 * 3. 对找到的有效项计算其边距信息
 *
 * @returns {ViewportItemResult} 分析结果：
 * - 当找到有效项时返回 found 状态，包含：
 *   - item: 数据源中的对应项
 *   - index: 数据项在源数据中的索引
 *   - margins: 计算得到的前后边距信息
 * - 未找到有效项时返回 not-found 状态
 */
const analyzeViewportAnchor = (): ViewportAnchorResult<T> => {
  const visibleItems = getVisibleViewportItems();

  for (const [, item] of visibleItems.entries()) {
    const dataIndex = findIndexByKey(item.key);
    if (dataIndex > -1) {
      return {
        status: "found",
        item: props.dataSource[dataIndex],
        index: dataIndex,
        margins: calculateItemMargins(item),
      };
    }
  }

  return { status: "not-found" };
};

/**
 * 处理滚动位置重构逻辑
 * @description 当检测到有效定位项时进行位置校准，否则重置状态
 */
const handleScrollRepositioning = async () => {
  const result = analyzeViewportAnchor();
  if (result.status === "found") {
    await adjustScrollPosition(result.item, result.index, result.margins);
    await startScrollAnimation(delayTaskPromise?.isRunning);
  } else {
    resetScrollState();
    scrollItems.value = [];
    await initializeScrollProcess();
  }
};

/**
 * 初始化滚动流程
 * @description 预加载初始数据并启动滚动动画
 */
const initializeScrollProcess = async () => {
  await loadDataBatch(0, viewportSize.value * 2, "next");
  await startScrollAnimation();
};

/**
 * 将原始数据映射为滚动项数据
 * @description 接收一个数据数组，并通过 createScrollItem 函数转换为 scrollItems 所需的格式
 */
const mapToScrollItems = (data: T[]) =>
  data.map((item) => createScrollItem(item));

/**
 * 验证列表是否具备可滚动性
 * @returns 是否满足可滚动条件
 * @description 通过分批次加载数据检测内容尺寸
 */
const validateScrollCapability = async () => {
  const maxLoadBatches = Math.ceil(props.dataSource.length / props.loadCount);
  let currentBatch = 0;
  const cachedScrollItems = scrollItems.value;

  while (currentBatch++ < maxLoadBatches) {
    const partialData = props.dataSource.slice(
      0,
      props.loadCount * (currentBatch + 1),
    );
    if (!isForward.value) {
      partialData.reverse();
    }

    scrollItems.value = mapToScrollItems(partialData);

    await executeNextTick();

    updateContainerMetrics();

    if (isScrollable.value) {
      scrollItems.value = cachedScrollItems;
      return true;
    }
  }
  scrollItems.value = mapToScrollItems(props.dataSource);
  return false;
};

/* ---------------------------- 生命周期管理 ---------------------------- */
onMounted(() => {
  /** 监听数据源变化自动重置滚动 */
  watch(
    () => [props.dataSource, updateCounter.value],
    async () => {
      try {
        // 中断异步操作并清理状态
        if (isNextTickCancellable()) {
          cancelNextTick();
        }

        if (state.isScrolling) {
          stopAllEffects(); // 停止所有动画
        }

        // 验证滚动能力
        if (!(await validateScrollCapability())) {
          resetScrollState();
          return;
        }

        // 根据当前滚动状态选择处理方式
        state.isScrolling
          ? await handleScrollRepositioning()
          : await initializeScrollProcess();
      } catch (error: any) {
        if (!isNextTickCancelledError(error)) {
          console.error(error);
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  /** 监听滚动方向变化，重置刷新 */
  watch(
    () => props.direction,
    () => {
      resetScrollState();
      triggerUpdate();
    },
  );

  /** 监听 "可视区域内容" 尺寸变化 */
  useResizeObserver(scrollViewportRef, (entry) => {
    const { blockSize: viewportHeight, inlineSize: viewportWidth } =
      entry[0].contentBoxSize[0];

    if (
      viewportHeight !== scrollMetrics.viewportHeight ||
      viewportWidth !== scrollMetrics.viewportWidth
    ) {
      triggerUpdate();
    }
  });

  /** 监听 "滚动内容区域" 尺寸变化 */
  useResizeObserver(scrollTrackRef, (entry) => {
    const { blockSize: trackHeight, inlineSize: trackWidth } =
      entry[0].contentBoxSize[0];

    if (
      trackHeight !== scrollMetrics.trackHeight ||
      trackWidth !== scrollMetrics.trackWidth
    ) {
      triggerUpdate();
    }
  });
});

/** 组件卸载时，停止所有滚动副作用 */
onBeforeUnmount(() => {
  stopAllEffects();
});
</script>

<template>
  <div
    v-if="scrollItems.length > 0"
    ref="scrollViewportRef"
    class="scroll-loop-viewport"
    :class="[
      isVertical ? 'direction-vertical' : 'direction-horizontal',
      isForward ? 'direction-forward' : 'direction-backward',
    ]"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
  >
    <div ref="scrollTrackRef" class="scroll-loop-track" :style="transformStyle">
      <div
        class="scroll-loop-item"
        v-for="item in scrollItems"
        :data-uid="item.uid"
        :data-key="item.key"
        :key="item.uid"
      >
        <slot v-bind="{ item: item.value }">
          {{ item.value }}
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-loop-viewport {
  overflow: hidden;
  &.direction-forward {
    > .scroll-loop-track::before {
      content: "";
    }
  }
  &.direction-backward {
    > .scroll-loop-track::after {
      content: "";
    }
  }
  &.direction-vertical {
    height: 100%;
    > .scroll-loop-track {
      display: flow-root;
    }
  }
  &.direction-horizontal {
    > .scroll-loop-track {
      display: flex;
      width: max-content;
    }
  }
}
</style>
