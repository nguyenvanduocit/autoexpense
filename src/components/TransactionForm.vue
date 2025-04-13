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

const categoryIcons: Record<TransactionCategory, string> = {
  [TransactionCategory.Fuel]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M3 22V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14M3 10h12"/>
    <path d="M15 4h1a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2"/>
    <path d="M15 8a2 2 0 0 1 2-2"/>
  </svg>`,
  [TransactionCategory.Maintenance]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>`,
  [TransactionCategory.Insurance]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2l7 4v6c0 5.5-3.8 10-7 12-3.2-2-7-6.5-7-12V6l7-4z"/>
  </svg>`,
  [TransactionCategory.Other]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v.01M12 8v4"/>
  </svg>`,
  [TransactionCategory.Toll]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4h16v16H4z M4 12h16"/>
  </svg>`,
  [TransactionCategory.Parking]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M5 5h14v14H5zM9 5v14M9 12h6"/>
  </svg>`,
  [TransactionCategory.Wash]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M3 17h18M8 17c0-5 8-5 8-10"/>
  </svg>`,
  [TransactionCategory.Accessories]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>`,
  [TransactionCategory.Fine]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2l10 10-10 10L2 12z"/>
  </svg>`,
  [TransactionCategory.ServiceCharge]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2l10 10-10 10L2 12z"/>
  </svg>`,
  [TransactionCategory.Sale]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 9h16M4 15h16M10 3v18M14 3v18"/>
  </svg>`,
  [TransactionCategory.Rental]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M8 9h8M8 13h4"/>
  </svg>`,
  [TransactionCategory.Refund]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M2 12h6M2 12l3-3M2 12l3 3M22 12h-6M22 12l-3-3M22 12l-3 3M12 2v6M12 2l3 3M12 2L9 5M12 22v-6M12 22l3-3M12 22l-3-3"/>
  </svg>`,
  [TransactionCategory.Compensation]: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>`
};

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
    <form v-else @submit.prevent="handleSubmit" class="space-y-6 bg-white rounded-lg shadow p-6">
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
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <button v-for="category in expenseCategories" :key="category" type="button"
            @click="transaction.category = category" :class="[
              'p-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors',
              transaction.category === category
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
]">
            <span v-html="categoryIcons[category]" class="w-8 h-8"></span>
            <span class="text-sm">{{ category }}</span>
          </button>
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
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- Submit button -->
      <div class="flex justify-center">
        <button type="submit" :disabled="isSubmitting"
          class="inline-flex justify-center py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
          <slot name="submit-text">
            {{ isSubmitting ? "Đang lưu..." : "Lưu giao dịch" }}
          </slot>
        </button>
      </div>
    </form>
  </div>
</template>
