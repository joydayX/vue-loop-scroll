import { ref } from "vue";

export const useForceUpdate = () => {
  const updateCounter = ref(0);
  const triggerUpdate = () => {
    updateCounter.value++;
  };

  return {
    updateCounter,
    triggerUpdate,
  };
};
