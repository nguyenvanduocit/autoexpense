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

// Thêm ref để theo dõi thời gian tạo tài khoản
const createdAt = ref(auth.currentUser?.metadata.creationTime || '');
const lastSignIn = ref(auth.currentUser?.metadata.lastSignInTime || '');

// Format date function
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Thông tin cơ bản -->
        <div class="space-y-4">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-500">Email</span>
            <span class="text-base">{{ user?.email || 'Chưa cập nhật' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-500">Tên người dùng</span>
            <span class="text-base">{{ user?.displayName || 'Chưa cập nhật' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-500">ID người dùng</span>
            <span class="text-base font-mono text-sm">{{ user?.uid }}</span>
          </div>
        </div>

        <!-- Thông tin thời gian -->
        <div class="space-y-4">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-500">Ngày tạo tài khoản</span>
            <span class="text-base">{{ formatDate(createdAt) }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-500">Đăng nhập lần cuối</span>
            <span class="text-base">{{ formatDate(lastSignIn) }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-500">Trạng thái email</span>
            <span class="text-base flex items-center">
              <span 
                :class="user?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ user?.emailVerified ? 'Đã xác thực' : 'Chưa xác thực' }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex space-x-4">
        <button
          @click="handleLogout"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Quản lý dữ liệu</h2>
      
      <div class="mb-4">
        <h3 class="text-base font-medium text-gray-900 mb-2">Dọn dẹp dữ liệu giao dịch thừa</h3>
        <p class="text-sm text-gray-600 mb-3">
          Tính năng này giúp xóa các giao dịch không hợp lệ trong trường hợp dữ liệu bị lỗi. 
          Chỉ sử dụng khi bạn nhận thấy:
        </p>
        <ul class="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
          <li>Tổng chi phí của xe không khớp với các giao dịch thực tế</li>
          <li>Có giao dịch của xe đã bị xóa vẫn còn tồn tại</li>
          <li>Số liệu thống kê hiển thị không chính xác</li>
        </ul>
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                Lưu ý: Đây là tính năng bảo trì dữ liệu. Chỉ sử dụng khi thực sự cần thiết vì các giao dịch bị xóa sẽ không thể khôi phục.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="deleteOrphanedTransactions"
        :disabled="isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        <svg v-if="!isLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <svg v-else class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="isLoading">Đang xóa...</span>
        <span v-else>Xóa giao dịch không hợp lệ</span>
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
