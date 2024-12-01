<script setup lang="ts">
import type { Transaction } from "../../types";

defineProps<{
  transactions: Transaction[];
}>();

const emit = defineEmits<{
  (e: 'click', transactionId: string): void;
}>();

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};
</script>

<template>
  <div class="bg-white rounded-lg shadow mb-8">
    <div class="p-6">
      <h2 class="text-lg font-semibold mb-4">Giao dịch gần đây</h2>
      <div class="space-y-4">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          @click="emit('click', transaction.id)"
          class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
        >
          <div>
            <p class="font-medium">
              {{ transaction.description || transaction.category }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatDate(transaction.date) }}
            </p>
          </div>
          <div class="text-red-600">
            {{ formatCurrency(transaction.amount) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>