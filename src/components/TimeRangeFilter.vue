<script setup lang="ts">
import type { TimeRange } from '../types'
defineProps<{
  modelValue: TimeRange
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TimeRange]
}>()

function updateTimeRange(value: TimeRange) {
  emit('update:modelValue', value)
}

const options = [
  { value: 'week' as TimeRange, label: 'This Week' },
  { value: 'month' as TimeRange, label: 'This Month' },
  { value: 'quarter' as TimeRange, label: 'This Quarter' },
  { value: 'all' as TimeRange, label: 'All Time' }
]

const handleChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as TimeRange
  updateTimeRange(value)
}
</script>

<template>
  <div class="time-range-filter">
    <select 
      :value="modelValue"
      @change="handleChange"
      class="form-select"
    >
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.time-range-filter {
  display: flex;
  gap: 0.5rem;
}

.form-select {
  padding: 0.25rem 0.75rem;
  border: 1px solid #e2e8f0;
  background-color: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.form-select:hover {
  background-color: #f8fafc;
}

.form-select.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
</style> 