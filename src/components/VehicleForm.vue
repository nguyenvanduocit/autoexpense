<script setup lang="ts">
import { ref, watch } from "vue";
import type { Vehicle } from "../types";

interface Props {
  initialData?: Partial<Vehicle>;
  isSubmitting?: boolean;
  error?: string;
}

// Định nghĩa type cho vehicle form data
interface VehicleFormData {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
  }),
  isSubmitting: false,
  error: "",
});

const emit = defineEmits<{
  submit: [vehicle: Omit<Vehicle, 'id'>]
}>();

// Khởi tạo vehicle với type cụ thể và giá trị mặc định
const vehicle = ref<VehicleFormData>({
  licensePlate: props.initialData?.licensePlate || "",
  brand: props.initialData?.brand || "",
  model: props.initialData?.model || "",
  year: props.initialData?.year || new Date().getFullYear(),
});

// Cập nhật form khi initialData thay đổi
watch(() => props.initialData, (newData) => {
  if (newData) {
    vehicle.value = {
      licensePlate: newData.licensePlate || vehicle.value.licensePlate,
      brand: newData.brand || vehicle.value.brand,
      model: newData.model || vehicle.value.model,
      year: newData.year || vehicle.value.year,
    };
  }
}, { deep: true });

const handleSubmit = () => {
  // Bây giờ vehicle.value đã có đúng type và đầy đủ các trường
  emit('submit', vehicle.value);
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 bg-white rounded-lg shadow p-6">
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
</template> 