<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFirestore } from 'vuefire';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from "../config/firebase";
import type { Vehicle } from "../types";
import VehicleForm from "../components/VehicleForm.vue";

const router = useRouter();
const error = ref("");
const isSubmitting = ref(false);
const db = useFirestore();
const userId = auth.currentUser?.uid;

const handleSubmit = async (vehicle: Omit<Vehicle, 'id'>) => {
  try {
    isSubmitting.value = true;
    error.value = "";

    if (!userId) {
      error.value = "Vui lòng đăng nhập";
      return;
    }

    await addDoc(collection(db, `users/${userId}/vehicles`), vehicle);
    router.push("/");
  } catch (e) {
    error.value = "Có lỗi xảy ra khi lưu thông tin xe";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Thêm xe mới</h1>
      <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
        ← Quay lại
      </button>
    </div>

    <VehicleForm
      :error="error"
      :is-submitting="isSubmitting"
      @submit="handleSubmit"
    />
  </div>
</template>
