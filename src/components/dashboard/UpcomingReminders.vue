<script setup lang="ts">
import type { Reminder } from "../../types";

defineProps<{
  reminders: Reminder[];
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};
</script>

<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6">
      <h2 class="text-lg font-semibold mb-4">Nhắc nhở sắp tới</h2>
      <div class="space-y-4">
        <div
          v-for="reminder in reminders"
          :key="reminder.id"
          class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
        >
          <div>
            <p class="font-medium">{{ reminder.description }}</p>
            <p class="text-sm text-gray-500">
              Hạn: {{ formatDate(reminder.dueDate) }}
            </p>
          </div>
          <div class="text-yellow-600">
            {{ reminder.type }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>