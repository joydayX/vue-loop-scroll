# Vue Loop Scroll

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**中文** | [English](./README.md)

## 🚀 特性

- 🔥 超大数据流畅滚动
  - 即使 10 万条数据，也能丝滑滚动不卡顿！仅渲染可视区域的 2 倍数据，大幅减少 DOM 负担，让滚动更流畅。
- 🌟 适应变化，始终顺滑
  - 支持容器大小动态调整，即使数据实时更新，依然能保持平滑滚动，提供最佳用户体验。
- 🔧 灵活滚动控制
  - 支持四向滚动、单步停顿、滚动速度调节、鼠标悬停控制等多种配置，让滚动更符合需求。

## 文档

<https://joydayX.github.io/website-vue-loop-scroll/>

## 📦 安装

```bash
# npm
npm i @joyday/vue-loop-scroll
# pnpm
pnpm i @joyday/vue-loop-scroll
# yarn
yarn add @joyday/vue-loop-scroll
```

## 示例

### 1. 四个方向滚动

![Scroll in Direction Up](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%90%91%E4%B8%8A%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700804839)

![Scroll in Direction Down](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%90%91%E4%B8%8B%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700865824)

![Scroll in Direction Left](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%90%91%E5%B7%A6%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700825999)

![Scroll in Direction Right](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%90%91%E5%8F%B3%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700866570)

### 2. 滚动停顿

#### 单步滚动暂停

![Step-by-Step Pause-1](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%8D%95%E6%AD%A5%E6%BB%9A%E5%8A%A8%E5%81%9C%E9%A1%BF-1.gif?updatedAt=1744700886956)

![Step-by-Step Pause-2](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%8D%95%E6%AD%A5%E6%BB%9A%E5%8A%A8%E5%81%9C%E9%A1%BF-2.gif?updatedAt=1744700886365)

#### 翻页滚动暂停

![Step-by-Step Pause-3](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E6%BB%9A%E5%8A%A8%E5%81%9C%E9%A1%BF-%E6%8C%89%E9%A1%B5%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700948853)

### 3. 自适应视口大小 & 动态数据更新

![Responsive Viewport & Dynamic Data Update](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E8%87%AA%E9%80%82%E5%BA%94%E8%A7%86%E5%8F%A3%E5%A4%A7%E5%B0%8F%E5%92%8C%E5%8A%A8%E6%80%81%E6%95%B0%E6%8D%AE%E6%9B%B4%E6%96%B0.gif?updatedAt=1744700971941)

## 🦄 使用

### 1. 基础用法

组件的基本使用方法。

```html
<script setup lang="ts">
  import { ref } from "vue";
  import { LoopScroll } from "@joyday/vue-loop-scroll";

  const dataSource = ref([
    "1. scrolling scrolling scrolling",
    "2. scrolling scrolling scrolling",
    "3. scrolling scrolling scrolling",
    "4. scrolling scrolling scrolling",
  ]);
</script>

<template>
  <div class="box">
    <LoopScroll :dataSource></LoopScroll>
  </div>
</template>

<style scoped>
  .box {
    height: 150px;
    border: 1px solid red;
    :deep(.scroll-loop-item) {
      border-bottom: 1px dashed #000;
      padding: 10px 4px;
    }
  }
</style>
```

### 2. 自定义用法

可以使用插槽自定义渲染内容。

```html
<script setup lang="ts">
  import { ref } from "vue";
  import { LoopScroll } from "@joyday/vue-loop-scroll";

  const dataSource = ref([
    "1. scrolling scrolling scrolling",
    "2. scrolling scrolling scrolling",
    "3. scrolling scrolling scrolling",
    "4. scrolling scrolling scrolling",
  ]);
</script>

<template>
  <div class="box">
    <LoopScroll :dataSource>
      <template #default="{ item }">
        <span style="color: green">{{ item }}</span>
      </template>
    </LoopScroll>
  </div>
</template>

<style scoped>
  .box {
    height: 150px;
    border: 1px solid red;
    :deep(.scroll-loop-item) {
      border-bottom: 1px dashed #000;
      padding: 10px 4px;
    }
  }
</style>
```

### 3. 高级用法

可以配置滚动方向、单步暂停时间，并为数据项指定唯一标识键。

```html
<script setup lang="ts">
  import { ref } from "vue";
  import { LoopScroll } from "@joyday/vue-loop-scroll";

  const dataSource = ref(
    Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      value: "scrolling scrolling",
    })),
  );
</script>

<template>
  <div class="box">
    <LoopScroll :dataSource itemKey="id" direction="left" :waitTime="1000">
      <template #default="{ item }">
        <span>{{ item.id }}.{{ item.value }}</span>
      </template>
    </LoopScroll>
  </div>
</template>

<style scoped>
  .box {
    border: 1px solid red;
    width: 500px;
    :deep(.scroll-loop-item) {
      padding: 10px;
    }
  }
</style>
```

## 贡献指南

欢迎参与贡献！请阅读[贡献指南](./CONTRIBUTING.md)了解详情。

## 开源协议

本项目基于 [MIT 协议](./LICENSE) 授权。
