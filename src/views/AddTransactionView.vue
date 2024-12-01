<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { StorageService } from "../services/storage.service";
import TransactionForm from "../components/TransactionForm.vue";
import type { Transaction } from "../types";

const router = useRouter();
const error = ref("");
const isSubmitting = ref(false);

const handleSubmit = async (transaction: Transaction) => {
  try {
    isSubmitting.value = true;
    error.value = "";

    const newTransaction = {
      ...transaction,
      createdAt: new Date().toISOString(),
    };

    await StorageService.addTransaction(newTransaction);
    router.push("/");
  } catch (e) {
    console.error(e);
    error.value = "Có lỗi xảy ra khi lưu giao dịch";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Thêm giao dịch mới</h1>
      <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
        ← Quay lại
      </button>
    </div>

    <TransactionForm :is-submitting="isSubmitting" @submit="handleSubmit">
      <template #submit-text>
        {{ isSubmitting ? "Đang lưu..." : "Lưu giao dịch" }}
      </template>
    </TransactionForm>

    <div v-if="error" class="mt-4 text-red-600 text-sm">
      {{ error }}
    </div>
  </div>
</template>
