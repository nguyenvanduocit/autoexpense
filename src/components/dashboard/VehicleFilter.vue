<script setup lang="ts">
import { ref } from 'vue';
import type { Vehicle } from '../../types';
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps<{
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:selectedVehicleId', value: string | null): void;
  (e: 'deleteVehicle', vehicle: Vehicle): void;
}>();

const openDropdownId = ref<string | null>(null);

const toggleDropdown = (vehicleId: string) => {
  if (openDropdownId.value === vehicleId) {
    openDropdownId.value = null;
  } else {
    openDropdownId.value = vehicleId;
  }
};
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
    <div
      @click="emit('update:selectedVehicleId', null)"
      class="bg-white rounded-lg shadow p-3 cursor-pointer transition-all hover:shadow-md"
      :class="{ 'ring-2 ring-blue-500': selectedVehicleId === null }"
    >
      <span class="font-medium text-center text-sm">Tất cả xe</span>
    </div>
    <div
      v-for="vehicle in vehicles"
      :key="vehicle.id"
      class="bg-white rounded-lg shadow p-3 cursor-pointer transition-all hover:shadow-md relative"
      :class="{ 'ring-2 ring-blue-500': selectedVehicleId === vehicle.id }"
    >
      <div class="flex justify-between items-center">
        <div @click="emit('update:selectedVehicleId', vehicle.id)" class="flex-1">
          <span class="font-medium text-center text-sm">{{ vehicle.brand }} {{ vehicle.model }}</span>
        </div>
        <div class="relative">
          <button
            @click.stop="toggleDropdown(vehicle.id)"
            class="p-0.5 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <div
            v-show="openDropdownId === vehicle.id"
            class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          >
            <div class="py-1">
              <a
                @click.stop="router.push(`/vehicles/${vehicle.id}/edit`)"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Chỉnh sửa
              </a>
              <a
                @click.stop="emit('deleteVehicle', vehicle)"
                class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
              >
                Xóa
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>