<template>
  <EmptyStateMessage
    title="Chưa có giao dịch nào"
    message="Hãy thêm giao dịch đầu tiên để bắt đầu theo dõi chi phí của bạn."
    buttonText="+ Thêm giao dịch mới"
    buttonLink="/transactions/add"
  />
</template>

<script setup lang="ts">
import EmptyStateMessage from './EmptyStateMessage.vue';
</script>