<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { StorageService } from "../services/storage.service";
import TransactionForm from "../components/TransactionForm.vue";
import type { Transaction } from "../types";

const router = useRouter();
const route = useRoute();
const error = ref("");
const isSubmitting = ref(false);
const transaction = ref<Transaction | undefined>();

onMounted(async () => {
  const transactionId = route.params.id as string;
  const existingTransaction = await StorageService.getTransactionById(
    transactionId
  );

  if (!existingTransaction) {
    error.value = "Không tìm thấy giao dịch";
    return;
  }

  transaction.value = await existingTransaction;
});

const handleSubmit = async (updatedTransaction: Transaction) => {
  try {
    isSubmitting.value = true;
    error.value = "";

    StorageService.updateTransaction(updatedTransaction);
    router.push("/");
  } catch (e) {
    error.value = "Có lỗi xảy ra khi cập nhật giao dịch";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Chỉnh sửa giao dịch</h1>
      <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
        ← Quay lại
      </button>
    </div>

    <TransactionForm
      v-if="transaction"
      :initial-transaction="transaction"
      :is-submitting="isSubmitting"
      @submit="handleSubmit"
    >
      <template #submit-text>
        {{ isSubmitting ? "Đang lưu..." : "Cập nhật giao dịch" }}
      </template>
    </TransactionForm>

    <div v-else-if="error" class="text-center text-red-600 mt-8">
      {{ error }}
    </div>
  </div>
</template>
