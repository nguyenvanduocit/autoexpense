<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { StorageService } from "../services/storage.service";
import type { Transaction, Vehicle } from "../types";

const route = useRoute();
const router = useRouter();
const transaction = ref<Transaction | null>(null);
const vehicle = ref<Vehicle | null>(null);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const loadTransaction = async () => {
  const id = route.params.id as string;
  transaction.value = (await StorageService.getTransactionById(id)) || null;

  if (transaction.value) {
    vehicle.value =
      (await StorageService.getVehicleById(transaction.value.vehicleId)) ||
      null;
  }
};

const handleDelete = async () => {
  if (!transaction.value) return;

  if (confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
    await StorageService.deleteTransaction(transaction.value.id);
    router.push("/");
  }
};

onMounted(() => {
  loadTransaction();
});
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Chi tiết giao dịch</h1>
      <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
        ← Quay lại
      </button>
    </div>

    <div v-if="transaction" class="bg-white rounded-lg shadow">
      <!-- Header -->
      <div class="p-6 border-b">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-semibold">
              {{ transaction.description || "Không có mô tả" }}
            </h2>
            <p class="text-gray-500 mt-1">{{ formatDate(transaction.date) }}</p>
          </div>
          <div
            :class="{
              'text-red-600': true,
            }"
            class="text-2xl font-bold"
          >
            {{ formatCurrency(transaction.amount) }}
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Danh mục</h3>
            <p class="mt-1">{{ transaction.category }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500">Xe</h3>
            <p class="mt-1" v-if="vehicle">
              {{ vehicle.licensePlate }} - {{ vehicle.brand }}
              {{ vehicle.model }}
            </p>
          </div>
        </div>

        <div v-if="transaction.description" class="pt-4 border-t">
          <h3 class="text-sm font-medium text-gray-500">Ghi chú</h3>
          <p class="mt-1 whitespace-pre-wrap">{{ transaction.description }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-6 bg-gray-50 rounded-b-lg">
        <div class="flex justify-end space-x-4">
          <button
            @click="handleDelete"
            class="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
          >
            Xóa
          </button>
          <button
            @click="router.push(`/transactions/${transaction.id}/edit`)"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">Không tìm thấy giao dịch</p>
    </div>
  </div>
</template>
