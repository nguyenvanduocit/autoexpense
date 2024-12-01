<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <h2 class="text-xl font-bold mb-4">Chưa có giao dịch nào</h2>
    <p class="text-gray-600 mb-6">
      Hãy thêm giao dịch đầu tiên để bắt đầu theo dõi chi phí của bạn.
    </p>
    <button
      @click="router.push('/transactions/add')"
      class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      + Thêm giao dịch mới
    </button>
  </div>
</template>