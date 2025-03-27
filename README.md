# Vue Loop Scroll

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**English** | [中文](./README.zh-CN.md)

## 🔥 Responsive Viewport & Dynamic Data Update

![Image](https://github.com/user-attachments/assets/d35cfc49-9d91-4f09-863a-51ee45cca06a)

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
pnpm i vue-loop-scroll
```

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
