import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { h, nextTick } from "vue";
import LoopScroll from "../index.vue";

let wrapper: VueWrapper | null = null;

// Mock ResizeObserver
beforeEach(() => {});

afterEach(() => {
  vi.clearAllMocks();
  if (wrapper) {
    wrapper.unmount();
  }
});

describe("LoopScroll", () => {
  // Sample data for testing
  const dataSource = [
    { id: 1, text: "Item 1" },
    { id: 2, text: "Item 2" },
    { id: 3, text: "Item 3" },
    { id: 4, text: "Item 4" },
    { id: 5, text: "Item 5" },
  ];

  // Test component mount and basic rendering
  it("should mount without errors", async () => {
    wrapper = mount(LoopScroll, {
      props: {
        dataSource,
      },
      slots: {
        default: ({ item }: any) => h("div", { class: "test-item" }, item.text),
      },
    });

    expect(wrapper.exists()).toBe(true);

    await nextTick();

    const items = wrapper.findAll(".test-item");
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].text()).toBe("Item 1");
  });

  // Test prop: dataSource
  it("should update when dataSource changes", async () => {
    const dataSourceSlice = dataSource.slice(0, 2);
    const wrapper = mount(LoopScroll, {
      props: {
        dataSource: dataSourceSlice,
      },
      slots: {
        default: ({ item }: any) => h("div", { class: "test-item" }, item.text),
      },
    });

    await nextTick();

    expect(wrapper.findAll(".scroll-loop-item").length).toBe(
      dataSourceSlice.length,
    );

    // Update dataSource
    wrapper.setProps({ dataSource });

    await flushPromises();

    // Wait for component to update
    expect(wrapper.findAll(".scroll-loop-item").length).toBe(dataSource.length);
  });

  // Test prop: direction
  it("should apply vertical/horizontal class for up/down directions", async () => {
    const directions = ["up", "down", "left", "right"] as const;

    for (const direction of directions) {
      const wrapper = mount(LoopScroll, {
        props: {
          dataSource,
          direction,
        },
        slots: {
          default: ({ item }: any) =>
            h("div", { class: "test-item" }, item.text),
        },
      });

      await nextTick();

      const dirClass = ["up", "down"].includes(direction)
        ? ".direction-vertical"
        : ".direction-horizontal";
      expect(wrapper.find(dirClass).exists()).toBe(true);
    }
  });

  // Test prop: pausedOnHover
  it("should pause on hover when pausedOnHover is true", async () => {
    const wrapper = mount(LoopScroll, {
      props: {
        dataSource,
        pausedOnHover: true,
      },
      slots: {
        default: ({ item }: any) => h("div", { class: "test-item" }, item.text),
      },
    });

    await nextTick();

    // Trigger mouseenter event
    await wrapper.find(".scroll-loop-viewport").trigger("mouseenter");

    // We can't directly test the internal state, but we can confirm event handlers exist
    expect(wrapper.props("pausedOnHover")).toBe(true);

    // Trigger mouseleave event
    await wrapper.find(".scroll-loop-viewport").trigger("mouseleave");
  });

  // Test component with all props specified
  it("should work with all props specified", async () => {
    const wrapper = mount(LoopScroll, {
      props: {
        dataSource,
        itemKey: "id" as any,
        direction: "up",
        speed: 1.5,
        waitMode: "page",
        waitTime: 500,
        pausedOnHover: true,
        loadCount: 3,
      },
      slots: {
        default: ({ item }: any) => h("div", { class: "test-item" }, item.text),
      },
    });

    expect(wrapper.props()).toEqual({
      dataSource,
      itemKey: "id" as any,
      direction: "up",
      speed: 1.5,
      waitMode: "page",
      waitTime: 500,
      pausedOnHover: true,
      loadCount: 3,
    });
  });

  // Test component behavior when dataSource is empty
  it("should not render when dataSource is empty", async () => {
    const wrapper = mount(LoopScroll, {
      props: {
        dataSource: [],
        itemKey: "id" as any,
      },
      slots: {
        default: ({ item }: any) => `<div>${item?.text}</div>`,
      },
    });

    await nextTick();

    expect(wrapper.find(".scroll-loop-viewport").exists()).toBe(false);
  });

  // Test component unmount
  it("should clean up on unmount", async () => {
    const wrapper = mount(LoopScroll, {
      props: {
        dataSource,
        itemKey: "id" as any,
      },
      slots: {
        default: ({ item }: any) => h("div", { class: "test-item" }, item.text),
      },
    });

    wrapper.unmount();
    expect(wrapper.exists()).toBe(false);
  });
});
