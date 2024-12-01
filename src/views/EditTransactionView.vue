<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFirestore } from 'vuefire';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from "../config/firebase";
import TransactionForm from "../components/TransactionForm.vue";
import type { Transaction } from "../types";

const router = useRouter();
const route = useRoute();
const error = ref("");
const isSubmitting = ref(false);
const transaction = ref<Transaction | undefined>();
const db = useFirestore();
const userId = auth.currentUser?.uid;

onMounted(async () => {
  if (!userId) {
    error.value = "Vui lòng đăng nhập";
    return;
  }

  const transactionId = route.params.id as string;
  const transactionRef = doc(db, `users/${userId}/transactions/${transactionId}`);
  const transactionSnap = await getDoc(transactionRef);

  if (!transactionSnap.exists()) {
    error.value = "Không tìm thấy giao dịch";
    return;
  }

  transaction.value = { id: transactionSnap.id, ...transactionSnap.data() } as Transaction;
});

const handleSubmit = async (updatedTransaction: Transaction) => {
  try {
    isSubmitting.value = true;
    error.value = "";

    if (!userId) {
      error.value = "Vui lòng đăng nhập";
      return;
    }

    const transactionId = route.params.id as string;
    const { id, ...transactionData } = updatedTransaction;
    
    const transactionRef = doc(db, `users/${userId}/transactions/${transactionId}`);
    await updateDoc(transactionRef, transactionData);
    
    router.push(`/transactions/${transactionId}`);
  } catch (e) {
    console.error("Lỗi khi cập nhật:", e);
    error.value = "Có lỗi xảy ra khi cập nhật giao dịch. Vui lòng thử lại.";
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
    </TransactionForm>
    <div v-if="error" class="text-center text-red-600 mt-8">
      {{ error }}
    </div>
  </div>
</template>
