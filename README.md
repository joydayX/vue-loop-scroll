# Vue Loop Scroll

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**English** | [中文](./README.zh-CN.md)

## 🚀 Features

- 🔥 Ultra-Smooth Scrolling for Large Data Sets
  - Efficiently handles large data sets, rendering only visible content for smooth performance.
- 🌟 Adaptive & Seamless with Dynamic Changes
  - Seamlessly adapts to container size changes and real-time data updates, ensuring a consistently smooth scrolling experience.
- 🔧 Flexible Scrolling Controls
  - Offers flexible controls including four-direction scrolling, step pauses, speed adjustments, and hover interactions.

## Documentation

<https://joydayX.github.io/website-vue-loop-scroll/>

## 📦 Install

```bash
# npm
npm i @joyday/vue-loop-scroll
# pnpm
pnpm i @joyday/vue-loop-scroll
# yarn
yarn add @joyday/vue-loop-scroll
```

## Demo

### 1. Scroll in All Directions

![Scroll in Direction Up](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%90%91%E4%B8%8A%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700804839)

![Scroll in Direction Down](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%90%91%E4%B8%8B%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700865824)

![Scroll in Direction Left](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%90%91%E5%B7%A6%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700825999)

![Scroll in Direction Right](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%90%91%E5%8F%B3%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700866570)

### 2. Step-by-Step Pause

![Step-by-Step Pause-1](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%8D%95%E6%AD%A5%E6%BB%9A%E5%8A%A8%E5%81%9C%E9%A1%BF-1.gif?updatedAt=1744700886956)

![Step-by-Step Pause-2](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E5%8D%95%E6%AD%A5%E6%BB%9A%E5%8A%A8%E5%81%9C%E9%A1%BF-2.gif?updatedAt=1744700886365)

![Step-by-Step Pause-3](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E6%BB%9A%E5%8A%A8%E5%81%9C%E9%A1%BF-%E6%8C%89%E9%A1%B5%E6%BB%9A%E5%8A%A8.gif?updatedAt=1744700948853)

### 3. Responsive Viewport & Dynamic Data Update

![Responsive Viewport & Dynamic Data Update](https://ik.imagekit.io/uxo1w62ii/npm/vue-loop-scroll/%E8%87%AA%E9%80%82%E5%BA%94%E8%A7%86%E5%8F%A3%E5%A4%A7%E5%B0%8F%E5%92%8C%E5%8A%A8%E6%80%81%E6%95%B0%E6%8D%AE%E6%9B%B4%E6%96%B0.gif?updatedAt=1744700971941)

## 🦄 Usage

### 1. Basic Usage

The basic usage of the component.

```html
<script setup lang="ts">
  import { LoopScroll } from "@joyday/vue-loop-scroll";

  const dataSource = [
    "1. scrolling scrolling scrolling",
    "2. scrolling scrolling scrolling",
    "3. scrolling scrolling scrolling",
    "4. scrolling scrolling scrolling",
  ];
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

### 2. Customize Usage

You can customize the rendering content using `slot`.

```html
<script setup lang="ts">
  import { LoopScroll } from "@joyday/vue-loop-scroll";

  const dataSource = [
    "1. scrolling scrolling scrolling",
    "2. scrolling scrolling scrolling",
    "3. scrolling scrolling scrolling",
    "4. scrolling scrolling scrolling",
  ];
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

### 3. Advanced Usage

You can pass scrolling direction, pause time per step, and specify a unique key for each data item.

```html
<script setup lang="ts">
  import { LoopScroll } from "@joyday/vue-loop-scroll";

  const dataSource = Array.from({ length: 4 }, (_, index) => ({
    id: index + 1,
    value: "scrolling scrolling",
  }));
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

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License.
