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
    <!-- Income Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Tổng thu nhập</h3>
      <p class="text-2xl font-bold text-green-600">
        {{ formatCurrency(stats.totalIncome) }}
      </p>
    </div>

    <!-- Expense Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Tổng chi phí</h3>
      <p class="text-2xl font-bold text-red-600">
        {{ formatCurrency(stats.totalExpenses) }}
      </p>
    </div>

    <!-- Net Balance Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Số dư</h3>
      <p class="text-2xl font-bold" :class="stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'">
        {{ formatCurrency(stats.netBalance) }}
      </p>
    </div>

    <!-- Monthly Income Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Thu nhập tháng này</h3>
      <p class="text-2xl font-bold text-green-600">
        {{ formatCurrency(stats.monthlyIncome) }}
      </p>
    </div>

    <!-- Monthly Expense Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Chi phí tháng này</h3>
      <p class="text-2xl font-bold text-red-600">
        {{ formatCurrency(stats.monthlyExpenses) }}
      </p>
    </div>

    <!-- Monthly Balance Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-gray-500 text-sm font-medium">Số dư tháng này</h3>
      <p class="text-2xl font-bold" :class="stats.monthlyNetBalance >= 0 ? 'text-green-600' : 'text-red-600'">
        {{ formatCurrency(stats.monthlyNetBalance) }}
      </p>
    </div>
  </div>
</template>