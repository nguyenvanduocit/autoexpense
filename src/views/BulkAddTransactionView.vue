<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useFirestore } from "vuefire";
import { collection } from "firebase/firestore";
import { useCollection } from "vuefire";
import { auth } from "../config/firebase";
import { transactionService } from "../services/transaction.service";
import { Transaction, Vehicle } from "../types";
import { RouterLink } from "vue-router";

const router = useRouter();
const db = useFirestore();
const userId = auth.currentUser?.uid;

// Get user vehicles
const { data: vehiclesCollection } = useCollection<Vehicle>(
  collection(db, `users/${userId}/vehicles`)
);

// Check if vehicles are available
const hasVehicles = computed(() =>
  vehiclesCollection.value && Array.isArray(vehiclesCollection.value) && vehiclesCollection.value.length > 0
);

// States
const transactionText = ref<string>("");
const parsedTransactions = ref<Transaction[]>([]);
const isSubmitting = ref<boolean>(false);
const isParsingLoading = ref<boolean>(false);
const error = ref<string>("");
const successMessage = ref<string>("");
const selectedVehicleId = ref<string>("");

// Formatting functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// Computed properties
const isParseDisabled = computed(() => {
  return !transactionText.value.trim();
});

const isAddDisabled = computed(() => {
  return !parsedTransactions.value.length ||
    !hasVehicles.value ||
    !selectedVehicleId.value;
});

const showAddVehiclePrompt = computed(() => !hasVehicles.value);

// Methods
const parseTransactions = async () => {
  error.value = "";
  if (!transactionText.value.trim()) {
    error.value = "Please enter transaction text";
    return;
  }

  isParsingLoading.value = true;

  try {
    const parsed = await transactionService.parseTransactions(transactionText.value);

    // Clear previous transactions
    parsedTransactions.value = [];

    // Map parsed transactions to our format
    parsedTransactions.value = parsed.map(item => ({
      id: "", // Will be assigned by Firestore
      description: item.description,
      amount: item.amount,
      date: item.date,
      category: item.category,
      vehicleId: "",
      transactionType: item.transactionType,
    }));

    // Set default vehicle if only one is available
    if (hasVehicles.value && vehiclesCollection.value?.length === 1) {
      selectedVehicleId.value = vehiclesCollection.value[0].id;
    }

  } catch (err: any) {
    error.value = err.message || "Could not identify any transactions";
  } finally {
    isParsingLoading.value = false;
  }
};

const updateAllVehicles = (vehicleId: string) => {
  selectedVehicleId.value = vehicleId;
};

const saveTransactions = async () => {
  error.value = "";
  successMessage.value = "";

  // Check if a vehicle is selected
  if (!selectedVehicleId.value) {
    error.value = "Please select a vehicle for the transactions";
    return;
  }

  isSubmitting.value = true;

  try {
    // Apply the selected vehicle to all transactions
    const transactionsToSave = parsedTransactions.value.map(t => ({
      ...t,
      vehicleId: selectedVehicleId.value
    }));

    await transactionService.addBulkTransactions(transactionsToSave);
    successMessage.value = "Transactions successfully added";

    // Clear form after successful submission
    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (err: any) {
    error.value = err.message || "Error saving transactions";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Thêm giao dịch hàng loạt</h1>
      <button @click="router.back()"
        class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        aria-label="Quay lại">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clip-rule="evenodd" />
        </svg>
        Quay lại
      </button>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <!-- Transaction input form -->
      <div class="mb-6">
        <label for="transaction-text" class="block text-sm font-medium text-gray-700 mb-2">
          Nhập giao dịch bằng ngôn ngữ tự nhiên
        </label>
        <textarea id="transaction-text" v-model="transactionText" rows="6"
          placeholder="Ví dụ: Ăn trưa ở Subway 12.500đ hôm qua"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        <div class="mt-2 text-sm text-gray-500">
          Nhập mỗi giao dịch trên một dòng hoặc trong một đoạn văn. Bao gồm mô tả, số tiền và ngày bằng ngôn ngữ tự
          nhiên.
        </div>
      </div>

      <!-- Parse button -->
      <div class="mb-6">
        <button @click="parseTransactions" :disabled="isParseDisabled || isParsingLoading"
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :aria-busy="isParsingLoading ? 'true' : 'false'">
          <span v-if="isParsingLoading" class="inline-block mr-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
          </span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M7 9a2 2 0 012-2h2a2 2 0 012 2v1h1a2 2 0 012 2v.5a.5.5 0 01-.5.5H4.5a.5.5 0 01-.5-.5V12a2 2 0 012-2h1V9z"
              clip-rule="evenodd" />
            <path
              d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
          Phân tích giao dịch
        </button>
      </div>

      <!-- Add vehicle prompt -->
      <div v-if="showAddVehiclePrompt" class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p class="text-yellow-700 mb-3">
          Bạn cần thêm ít nhất một xe trước khi thêm giao dịch.
        </p>
        <RouterLink to="/vehicles/add"
          class="inline-flex justify-center py-2 px-6 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
          Thêm xe mới
        </RouterLink>
      </div>

      <!-- Error message -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

      <!-- Success message -->
      <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Vehicle selection for all transactions -->
      <div v-if="parsedTransactions.length && hasVehicles" class="mb-6">
        <label for="vehicle-selection" class="block text-sm font-medium text-gray-700 mb-2">
          Chọn xe cho tất cả giao dịch
        </label>
        <select id="vehicle-selection" v-model="selectedVehicleId"
          @change="(e) => updateAllVehicles((e.target as HTMLSelectElement).value)"
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto">
          <option value="" disabled>Chọn xe</option>
          <option v-for="vehicle in vehiclesCollection" :key="vehicle.id" :value="vehicle.id">
            {{ vehicle.licensePlate }} ({{ vehicle.brand }} {{ vehicle.model }})
          </option>
        </select>
      </div>

      <!-- Parsed transactions table -->
      <div v-if="parsedTransactions.length" class="mb-6">
        <h2 class="text-lg font-medium mb-4">Giao dịch đã phân tích</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in parsedTransactions" :key="transaction.description + transaction.amount">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ transaction.description }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(transaction.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(transaction.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ transaction.category }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span :class="{
                    'text-green-700 bg-green-100': transaction.transactionType === 'Income',
                    'text-red-700 bg-red-100': transaction.transactionType === 'Expense'
                  }" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ transaction.transactionType }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add transactions button -->
      <div class="flex justify-center">
        <button @click="saveTransactions" :disabled="isAddDisabled || isSubmitting"
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :aria-busy="isSubmitting ? 'true' : 'false'">
          <span v-if="isSubmitting" class="inline-block mr-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
          </span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clip-rule="evenodd" />
          </svg>
          Thêm giao dịch
        </button>
      </div>
    </div>
  </div>
</template>
