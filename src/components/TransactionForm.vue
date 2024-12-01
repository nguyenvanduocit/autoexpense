<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ExpenseCategory, Transaction, Vehicle } from "../types";
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
  category: props.initialTransaction?.category || ExpenseCategory.Fuel,
  vehicleId: props.initialTransaction?.vehicleId || "",
});

const db = useFirestore()
const userId = auth.currentUser?.uid
const vehicles = useCollection<Vehicle>(collection(db, `users/${userId}/vehicles`))
const error = ref("");
const isLoading = computed(() => !vehicles.value)
const showAddVehiclePrompt = computed(() => !isLoading.value && vehicles.value?.length === 0)

const expenseCategories = Object.values(ExpenseCategory);

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
  }
};
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-gray-700">Đang tải dữ liệu...</p>
    </div>

    <!-- Add Vehicle Prompt -->
    <div
      v-else-if="showAddVehiclePrompt"
      class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
    >
      <p class="text-yellow-700 mb-3">
        Bạn cần thêm ít nhất một xe trước khi tạo giao dịch
      </p>
      <RouterLink
        to="/vehicles/add"
        class="inline-flex justify-center py-2 px-6 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        Thêm xe mới
      </RouterLink>
    </div>

    <!-- Existing form -->
    <form
      v-else
      @submit.prevent="handleSubmit"
      class="space-y-6 bg-white rounded-lg shadow p-6"
    >
      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Số tiền *
        </label>
        <input
          v-model="transaction.amount"
          type="text"
          required
          @blur="handleAmountBlur"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Danh mục
        </label>
        <select
          v-model="transaction.category"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option
            v-for="category in expenseCategories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>

      <!-- Vehicle -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Xe *
        </label>
        <div class="space-y-2">
          <div
            v-for="vehicle in vehicles"
            :key="vehicle.id"
            class="flex items-center"
          >
            <input
              type="radio"
              :id="vehicle.id"
              :value="vehicle.id"
              v-model="transaction.vehicleId"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label :for="vehicle.id" class="ml-2 text-sm text-gray-700">
              {{ vehicle.licensePlate }} - {{ vehicle.brand }}
              {{ vehicle.model }}
            </label>
          </div>
        </div>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ngày
        </label>
        <input
          v-model="transaction.date"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú
        </label>
        <textarea
          v-model="transaction.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- Error message -->
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- Submit button -->
      <div class="flex justify-center">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex justify-center py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <slot name="submit-text">
            {{ isSubmitting ? "Đang lưu..." : "Lưu giao dịch" }}
          </slot>
        </button>
      </div>
    </form>
  </div>
</template>
