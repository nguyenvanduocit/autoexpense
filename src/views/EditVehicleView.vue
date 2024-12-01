<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFirestore } from 'vuefire';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth } from "../config/firebase";
import type { Vehicle } from "../types";
import VehicleForm from "../components/VehicleForm.vue";
import { onMounted } from "vue";

const router = useRouter();
const route = useRoute();
const error = ref("");
const isSubmitting = ref(false);
const vehicleData = ref<Partial<Vehicle>>({});
const isLoading = ref(true);

const db = useFirestore();
const userId = auth.currentUser?.uid;
const vehicleId = route.params.id as string;

onMounted(async () => {
  try {
    if (!userId) {
      error.value = "Vui lòng đăng nhập";
      return;
    }

    const vehicleDoc = await getDoc(doc(db, `users/${userId}/vehicles/${vehicleId}`));
    if (!vehicleDoc.exists()) {
      router.push('/');
      return;
    }

    vehicleData.value = vehicleDoc.data() as Vehicle;
  } catch (e) {
    error.value = "Có lỗi xảy ra khi tải thông tin xe";
  } finally {
    isLoading.value = false;
  }
});

const handleSubmit = async (vehicle: Omit<Vehicle, 'id'>) => {
  try {
    isSubmitting.value = true;
    error.value = "";

    if (!userId) {
      error.value = "Vui lòng đăng nhập";
      return;
    }

    await updateDoc(doc(db, `users/${userId}/vehicles/${vehicleId}`), vehicle);
    router.push("/");
  } catch (e) {
    error.value = "Có lỗi xảy ra khi cập nhật thông tin xe";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Chỉnh sửa thông tin xe</h1>
      <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
        ← Quay lại
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Đang tải thông tin xe...</p>
    </div>
    
    <VehicleForm
      v-else
      :initial-data="vehicleData"
      :error="error"
      :is-submitting="isSubmitting"
      @submit="handleSubmit"
    />
  </div>
</template> 