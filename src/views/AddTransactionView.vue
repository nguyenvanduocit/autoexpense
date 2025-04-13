<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFirestore } from 'vuefire';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from "../config/firebase";
import TransactionForm from "../components/TransactionForm.vue";
import type { Transaction } from "../types";

const router = useRouter();
const error = ref("");
const isSubmitting = ref(false);
const db = useFirestore();
const userId = auth.currentUser?.uid;

const handleSubmit = async (transaction: Transaction) => {
  try {
    isSubmitting.value = true;
    error.value = "";

    if (!userId) {
      error.value = "Vui lòng đăng nhập";
      return;
    }

    const newTransaction = {
      ...transaction,
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, `users/${userId}/transactions`), newTransaction);
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
      <TransactionForm :is-submitting="isSubmitting" @submit="handleSubmit">
        <template #submit-text>
          {{ isSubmitting ? "Đang lưu..." : "Lưu giao dịch" }}
        </template>
      </TransactionForm>

      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
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
    </div>
  </div>
</template>
