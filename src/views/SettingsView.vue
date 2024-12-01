<script setup lang="ts">
import { ref } from "vue";
import { useFirestore } from "vuefire";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
import { auth } from "../config/firebase";
import { useAuth } from "../composables/useAuth";

const { user, logout } = useAuth();
const isLoading = ref(false);
const db = useFirestore();

// Thêm các ref để quản lý dialog
const showDialog = ref(false);
const dialogMessage = ref("");
const dialogType = ref<"success" | "error">("success");

const deleteOrphanedTransactions = async () => {
  isLoading.value = true;
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get all vehicles
    const vehiclesRef = collection(db, `users/${userId}/vehicles`);
    const vehiclesSnapshot = await getDocs(vehiclesRef);
    const vehicleIds = vehiclesSnapshot.docs.map((doc) => doc.id);

    // Get all transactions that reference non-existent vehicles
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    const transactionsSnapshot = await getDocs(transactionsRef);

    const deletePromises = transactionsSnapshot.docs
      .filter((doc) => {
        const transaction = doc.data();
        return !vehicleIds.includes(transaction.vehicleId);
      })
      .map((doc) => deleteDoc(doc.ref));

    await Promise.all(deletePromises);
    
    // Hiển thị thông báo thành công
    dialogMessage.value = "Đã xóa thành công các giao dịch không có xe!";
    dialogType.value = "success";
    showDialog.value = true;
  } catch (error) {
    // Hiển thị thông báo lỗi
    dialogMessage.value = "Có lỗi xảy ra khi xóa giao dịch!";
    dialogType.value = "error";
    showDialog.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error("Error logging out:", error);
    alert("Có lỗi xảy ra khi đăng xuất!");
  }
};
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Cài đặt</h1>

    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">
        Thông tin tài khoản
      </h2>
      <div class="space-y-3">
        <div>
          <span class="text-gray-500">Email:</span>
          <span class="ml-2">{{ user?.email }}</span>
        </div>
        <div>
          <span class="text-gray-500">Tên người dùng:</span>
          <span class="ml-2">{{ user?.displayName }}</span>
        </div>
        <button
          @click="handleLogout"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Đăng xuất
        </button>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Quản lý dữ liệu</h2>
      <button
        @click="deleteOrphanedTransactions"
        :disabled="isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        <span v-if="isLoading">Đang xóa...</span>
        <span v-else>Xóa các giao dịch không có xe</span>
      </button>
    </div>

    <!-- Thêm dialog component -->
    <div v-if="showDialog" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div class="flex items-center mb-4">
          <div :class="[
            'w-8 h-8 rounded-full flex items-center justify-center',
            dialogType === 'success' ? 'bg-green-100' : 'bg-red-100'
          ]">
            <svg v-if="dialogType === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <span class="ml-3 text-lg font-medium" :class="dialogType === 'success' ? 'text-green-800' : 'text-red-800'">
            {{ dialogType === 'success' ? 'Thành công' : 'Lỗi' }}
          </span>
        </div>
        <p class="text-gray-600 mb-4">{{ dialogMessage }}</p>
        <button
          @click="showDialog = false"
          class="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>
