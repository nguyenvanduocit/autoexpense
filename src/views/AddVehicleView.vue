<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { StorageService } from "../services/storage.service";
import type { Vehicle } from "../types";

const router = useRouter();
const error = ref("");
const isSubmitting = ref(false);

const vehicle = ref({
  licensePlate: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
});

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    error.value = "";

    if (
      !vehicle.value.licensePlate ||
      !vehicle.value.brand ||
      !vehicle.value.model
    ) {
      error.value = "Vui lòng điền đầy đủ thông tin bắt buộc";
      return;
    }

    const newVehicle: Vehicle = {
      ...vehicle.value,
      id: crypto.randomUUID(),
    };

    StorageService.addVehicle(newVehicle);
    router.push("/");
  } catch (e) {
    error.value = "Có lỗi xảy ra khi lưu thông tin xe";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Thêm xe mới</h1>
      <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
        ← Quay lại
      </button>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="space-y-6 bg-white rounded-lg shadow p-6"
    >
      <!-- License Plate -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Biển số xe *
        </label>
        <input
          v-model="vehicle.licensePlate"
          type="text"
          required
          placeholder="Ví dụ: 30A-12345"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Brand -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Hãng xe *
        </label>
        <input
          v-model="vehicle.brand"
          type="text"
          required
          placeholder="Ví dụ: Toyota"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Model -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Mẫu xe *
        </label>
        <input
          v-model="vehicle.model"
          type="text"
          required
          placeholder="Ví dụ: Camry"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Year -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Năm sản xuất
        </label>
        <input
          v-model="vehicle.year"
          type="number"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Error message -->
      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- Submit button -->
      <div>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ isSubmitting ? "Đang lưu..." : "Lưu thông tin xe" }}
        </button>
      </div>
    </form>
  </div>
</template>
