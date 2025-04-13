<script setup lang="ts">
import { ref } from "vue";
import { useFirestore } from "vuefire";
import { collection, getDocs, deleteDoc, doc, setDoc, deleteDoc as deleteFirestoreDoc } from "firebase/firestore";
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

// Thêm ref để quản lý OpenAI API key
const openAIKey = ref('');
const showOpenAIKey = ref(false);
const isOpenAIKeyLoading = ref(false);

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

// Load API key from storage on component mount
async function loadApiKey() {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  try {
    const apiKeyRef = doc(db, `users/${userId}/settings/openAIKey`);
    const docSnap = await getDocs(collection(db, `users/${userId}/settings`));
    docSnap.forEach(doc => {
      if (doc.id === 'openAIKey') {
        openAIKey.value = doc.data().key || '';
      }
    });
  } catch (error) {
    console.error("Error loading API key:", error);
  }
}

// Call loadApiKey on component mount
loadApiKey();

const saveApiKey = async () => {
  isOpenAIKeyLoading.value = true;
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const apiKeyRef = doc(db, `users/${userId}/settings/openAIKey`);
    await setDoc(apiKeyRef, { key: openAIKey.value });

    dialogMessage.value = openAIKey.value ? "Đã lưu thành công API key!" : "Đã xóa API key thành công!";
    dialogType.value = "success";
    showDialog.value = true;
  } catch (error) {
    dialogMessage.value = "Có lỗi xảy ra khi lưu API key!";
    dialogType.value = "error";
    showDialog.value = true;
  } finally {
    isOpenAIKeyLoading.value = false;
  }
};

const removeApiKey = async () => {
  isOpenAIKeyLoading.value = true;
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const apiKeyRef = doc(db, `users/${userId}/settings/openAIKey`);
    await deleteFirestoreDoc(apiKeyRef);
    openAIKey.value = '';

    dialogMessage.value = "Đã xóa API key thành công!";
    dialogType.value = "success";
    showDialog.value = true;
  } catch (error) {
    dialogMessage.value = "Có lỗi xảy ra khi xóa API key!";
    dialogType.value = "error";
    showDialog.value = true;
  } finally {
    isOpenAIKeyLoading.value = false;
  }
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
              <span :class="user?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ user?.emailVerified ? 'Đã xác thực' : 'Chưa xác thực' }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex space-x-4">
        <button @click="handleLogout"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Cấu hình API</h2>

      <div class="mb-4">
        <h3 class="text-base font-medium text-gray-900 mb-2">OpenAI API Key</h3>
        <p class="text-sm text-gray-600 mb-3">
          Nhập API key của bạn để tích hợp với OpenAI. API key sẽ được lưu trữ an toàn.
        </p>
        <div class="mt-2 space-y-3">
          <div class="relative">
            <input v-model="openAIKey" :type="showOpenAIKey ? 'text' : 'password'" placeholder="Nhập OpenAI API key"
              class="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button @click="showOpenAIKey = !showOpenAIKey" class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg v-if="showOpenAIKey" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 5.943 7.523 2 12 2c4.478 0 8.268 3.943 9.542 10-1.274 6.057-5.064 10-9.542 10S3.732 18.057 2.458 12z" />
              </svg>
              <svg v-else class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-3.943-9.543-10a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 3.943 9.543 10a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <div class="flex space-x-2">
            <button @click="saveApiKey" :disabled="isOpenAIKeyLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              <svg v-if="!isOpenAIKeyLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m5.66-2.34l-.66.66-2-2-2 2-.66-.66a1 1 0 00-1.41 0l-2.34 2.34c-.39.39-.39 1.02 0 1.41l.66.66-2 2-2-2 .66-.66a1 1 0 000-1.41L9.34 5.66c.39-.39 1.02-.39 1.41 0l.66.66 2-2 2 2 .66-.66a1 1 0 011.41 0z" />
              </svg>
              <svg v-else class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <span v-if="isOpenAIKeyLoading">Đang lưu...</span>
              <span v-else>Lưu API Key</span>
            </button>
            <button @click="removeApiKey" :disabled="isOpenAIKeyLoading || !openAIKey"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
              <svg v-if="!isOpenAIKeyLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Xóa API Key</span>
            </button>
          </div>
        </div>
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700">
                API key của bạn được lưu trữ an toàn trong cơ sở dữ liệu và chỉ được sử dụng cho các yêu cầu API cần
                thiết.
              </p>
            </div>
          </div>
        </div>
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
                <path fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                Lưu ý: Đây là tính năng bảo trì dữ liệu. Chỉ sử dụng khi thực sự cần thiết vì các giao dịch bị xóa sẽ
                không thể khôi phục.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button @click="deleteOrphanedTransactions" :disabled="isLoading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
        <svg v-if="!isLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <svg v-else class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
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
            <svg v-if="dialogType === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
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
        <button @click="showDialog = false"
          class="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>
