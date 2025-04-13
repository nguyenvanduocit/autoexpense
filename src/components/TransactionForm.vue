<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { TransactionCategory, Transaction, Vehicle, TransactionType } from "../types";
import { useFirestore } from "vuefire";
import { auth } from "../config/firebase";
import { useCollection } from "vuefire";
import { collection } from 'firebase/firestore';
import { RouterLink } from "vue-router";
import { convertAmount } from '../utils/currency'

const props = defineProps<{
  initialTransaction?: Transaction;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [transaction: Transaction];
}>();

const transaction = ref<Transaction>({
  id: props.initialTransaction?.id || "",
  amount: props.initialTransaction?.amount || 0,
  date:
    props.initialTransaction?.date || new Date().toISOString().split("T")[0],
  description: props.initialTransaction?.description || "",
  category: props.initialTransaction?.category || TransactionCategory.Fuel,
  vehicleId: props.initialTransaction?.vehicleId || "",
  transactionType: props.initialTransaction?.transactionType || TransactionType.Expense,
});

const db = useFirestore()
const userId = auth.currentUser?.uid
const vehicles = useCollection<Vehicle>(collection(db, `users/${userId}/vehicles`))
const error = ref("");
const isLoading = computed(() => !vehicles.value)
const showAddVehiclePrompt = computed(() => !isLoading.value && vehicles.value?.length === 0)

const expenseCategories = Object.values(TransactionCategory);

const handleSubmit = () => {
  error.value = "";

  // Validate dữ liệu
  if (!transaction.value.amount) {
    error.value = "Vui lòng nhập số tiền";
    return;
  }

  if (!transaction.value.vehicleId) {
    error.value = "Vui lòng chọn xe";
    return;
  }

  if (!transaction.value.date) {
    error.value = "Vui lòng chọn ngày";
    return;
  }

  // Đảm bảo id được giữ nguyên khi cập nhật
  const submittingTransaction = {
    ...transaction.value,
    id: props.initialTransaction?.id || transaction.value.id,
  };

  emit("submit", submittingTransaction);
};

// Sync with parent when initialTransaction changes
watch(
  () => props.initialTransaction,
  (newVal) => {
    if (newVal) {
      transaction.value = { ...newVal };
    }
  }
);

const handleAmountBlur = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    const convertedAmount = convertAmount(target.value);
    transaction.value.amount = convertedAmount;
    target.value = convertedAmount.toString();

    // Auto-select transaction type based on amount sign
    if (convertedAmount < 0) {
      transaction.value.transactionType = TransactionType.Expense;
    } else {
      transaction.value.transactionType = TransactionType.Income;
    }
  }
};

// Auto-select transaction type when amount changes
watch(() => transaction.value.amount, (newAmount) => {
  if (newAmount < 0) {
    transaction.value.transactionType = TransactionType.Expense;
  } else {
    transaction.value.transactionType = TransactionType.Income;
  }
});
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-gray-700">Đang tải dữ liệu...</p>
    </div>

    <!-- Add Vehicle Prompt -->
    <div v-else-if="showAddVehiclePrompt" class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <p class="text-yellow-700 mb-3">
        Bạn cần thêm ít nhất một xe trước khi tạo giao dịch
      </p>
      <RouterLink to="/vehicles/add"
        class="inline-flex justify-center py-2 px-6 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
        Thêm xe mới
      </RouterLink>
    </div>

    <!-- Existing form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Số tiền *
        </label>
        <input v-model="transaction.amount" type="text" required @blur="handleAmountBlur"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <!-- Transaction Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Loại giao dịch
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" @click="transaction.transactionType = TransactionType.Expense" :class="[
            'p-3 rounded-lg border transition-colors flex items-center justify-center',
            transaction.transactionType === TransactionType.Expense
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'border-gray-200 hover:border-red-200 hover:bg-red-50'
          ]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M7 10l5 5 5-5"></path>
            </svg>
            <span>Chi tiêu</span>
          </button>
          <button type="button" @click="transaction.transactionType = TransactionType.Income" :class="[
            'p-3 rounded-lg border transition-colors flex items-center justify-center',
            transaction.transactionType === TransactionType.Income
              ? 'bg-green-50 border-green-500 text-green-700'
              : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
          ]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M7 14l5-5 5 5"></path>
            </svg>
            <span>Thu nhập</span>
          </button>
        </div>
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Danh mục
        </label>
        <div class="relative">
          <select v-model="transaction.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white pr-10">
            <option v-for="category in expenseCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Vehicle -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Xe *
        </label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button v-for="vehicle in vehicles" :key="vehicle.id" type="button"
            @click="transaction.vehicleId = vehicle.id" :class="[
              'p-4 rounded-lg border transition-colors',
              transaction.vehicleId === vehicle.id
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
]">
            <span class="text-sm">{{ vehicle.licensePlate }}</span>
          </button>
        </div>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ngày
        </label>
        <input v-model="transaction.date" type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú
        </label>
        <textarea v-model="transaction.description" rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
      </div>

      <!-- Error message -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Submit button -->
      <div class="flex justify-center">
        <button type="submit" :disabled="isSubmitting"
          class="inline-flex items-center justify-center py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
          <span v-if="isSubmitting" class="inline-block mr-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
          </span>
          <slot name="submit-text">
            {{ isSubmitting ? "Đang lưu..." : "Lưu giao dịch" }}
          </slot>
        </button>
      </div>
    </form>
  </div>
</template>
