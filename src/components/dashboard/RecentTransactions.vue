<script setup lang="ts">
import { computed } from "vue";
import type { Transaction } from "../../types";
import { TransactionType } from "../../types";

const props = defineProps<{
  transactions: Transaction[];
  currentPage: number;
  itemsPerPage: number;
}>();

const emit = defineEmits<{
  (e: 'click', transactionId: string): void;
  (e: 'updatePage', page: number): void;
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

const getAmountClass = (transactionType: TransactionType) => {
  return transactionType === TransactionType.Income ? 'text-green-600' : 'text-red-600';
};

const getAmountPrefix = (transactionType: TransactionType) => {
  return transactionType === TransactionType.Income ? '+' : '-';
};

const totalPages = Math.ceil(props.transactions.length / props.itemsPerPage);

const paginatedTransactions = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.transactions.slice(start, end);
});
</script>

<template>
  <div class="bg-white rounded-lg shadow mb-8">
    <div class="p-6">
      <h2 class="text-lg font-semibold mb-4">Giao dịch gần đây</h2>
      <div class="space-y-4">
        <div v-for="transaction in paginatedTransactions" :key="transaction.id" @click="emit('click', transaction.id)"
          class="flex items-center justify-between hover:bg-gray-50 rounded-lg cursor-pointer p-2">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-2"
              :class="transaction.transactionType === TransactionType.Income ? 'bg-green-100' : 'bg-red-100'">
              <span :class="transaction.transactionType === TransactionType.Income ? 'text-green-600' : 'text-red-600'">
                {{ transaction.transactionType === TransactionType.Income ? '↑' : '↓' }}
              </span>
            </div>
            <div>
              <p class="font-medium">
                {{ transaction.description }}{{ transaction.description ? ' - ' : '' }}{{ transaction.category }}
              </p>
              <p class="text-sm text-gray-500">
                {{ formatDate(transaction.date) }}
              </p>
            </div>
          </div>
          <div :class="getAmountClass(transaction.transactionType)" class="font-medium">
            {{ getAmountPrefix(transaction.transactionType) }} {{ formatCurrency(Math.abs(transaction.amount)) }}
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-4 pt-4 border-t">
        <button @click="emit('updatePage', currentPage - 1)" :disabled="currentPage === 1"
          class="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed">
          Trước
        </button>
        <span class="text-sm text-gray-600">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        <button @click="emit('updatePage', currentPage + 1)" :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed">
          Sau
        </button>
      </div>
    </div>
  </div>
</template>