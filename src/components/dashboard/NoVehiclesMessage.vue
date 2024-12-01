<template>
  <div class="text-center py-12">
    <EmptyStateMessage
      title="Chưa có xe nào"
      message="Bạn cần thêm ít nhất một xe để bắt đầu theo dõi chi phí."
      buttonText="+ Thêm xe mới"
      buttonLink="/vehicles/add"
      bgColor="bg-yellow-50"
      borderColor="border-yellow-200"
    />
  </div>
</template>

<script setup lang="ts">
import EmptyStateMessage from './EmptyStateMessage.vue';
</script>