<script setup lang="ts">
import type { DashboardStats } from "../../types";

defineProps<{
  stats: DashboardStats;
}>();

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Tổng chi phí</h3>
      <p class="text-2xl font-bold text-gray-900">
        {{ formatCurrency(stats.totalExpenses) }}
      </p>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Chi phí tháng này</h3>
      <p class="text-2xl font-bold text-gray-900">
        {{ formatCurrency(stats.monthlyExpenses) }}
      </p>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Số giao dịch</h3>
      <p class="text-2xl font-bold text-gray-900">
        {{ stats.recentTransactions.length }}
      </p>
    </div>
  </div>
</template>