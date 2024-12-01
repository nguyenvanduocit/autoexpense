import { ref, onMounted, onUnmounted } from "vue";

export function useElementSize() {
  const width = ref(0);
  const height = ref(0);
  const element = ref<HTMLElement | null>(null);

  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) {
      width.value = entry.contentRect.width;
      height.value = entry.contentRect.height;
    }
  });

  onMounted(() => {
    if (element.value) {
      resizeObserver.observe(element.value);
    }
  });

  onUnmounted(() => {
    resizeObserver.disconnect();
  });

  return {
    width,
    height,
    element,
  };
}
