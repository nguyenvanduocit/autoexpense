<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="text-center py-12">
    <div class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <h2 class="text-2xl font-bold mb-4">Chưa có xe nào</h2>
      <p class="text-gray-600 mb-6">
        Bạn cần thêm ít nhất một xe để bắt đầu theo dõi chi phí.
      </p>
      <button
        @click="router.push('/vehicles/add')"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        + Thêm xe mới
      </button>
    </div>
  </div>
</template>