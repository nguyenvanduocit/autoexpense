<script setup lang="ts">
import type { Vehicle } from "../../types";

defineProps<{
  show: boolean;
  vehicle: Vehicle | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-sm mx-auto">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa xe</h3>
      <p class="text-sm text-gray-500 mb-4">
        Bạn có chắc chắn muốn xóa xe {{ vehicle?.brand }} {{ vehicle?.model }}? 
        Hành động này không thể hoàn tác.
      </p>
      <div class="flex justify-end space-x-4">
        <button
          @click="emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
        >
          Hủy
        </button>
        <button
          @click="emit('confirm')"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
</template>