<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="time-range-buttons">
    <button 
      @click="$emit('update:modelValue', 'week')"
      :class="['time-btn', modelValue === 'week' ? 'active' : '']"
    >
      Tuần này
    </button>
    <button 
      @click="$emit('update:modelValue', 'month')"
      :class="['time-btn', modelValue === 'month' ? 'active' : '']"
    >
      Tháng này
    </button>
    <button 
      @click="$emit('update:modelValue', 'all')"
      :class="['time-btn', modelValue === 'all' ? 'active' : '']"
    >
      Tất cả
    </button>
  </div>
</template>

<style scoped>
.time-range-buttons {
  display: flex;
  gap: 0.5rem;
}

.time-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #e2e8f0;
  background-color: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.time-btn:hover {
  background-color: #f8fafc;
}

.time-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
</style> 