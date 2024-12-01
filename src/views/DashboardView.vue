<script setup lang="ts">
import { ref, computed } from "vue";
import { useCollection } from 'vuefire'
import { collection, deleteDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Transaction, DashboardStats, ExpenseCategory, Vehicle, Reminder } from "../types";
import { useRouter } from "vue-router";
import ExpenseAnalysisChart from "../components/ExpenseAnalysisChart.vue";
import { auth } from "../config/firebase";

const router = useRouter();
const db = useFirestore()
const userId = auth.currentUser?.uid

const selectedVehicle = ref<string | null>(null)

// Use VueFire's useCollection to get realtime data
const vehicles = useCollection<Vehicle>(collection(db, `users/${userId}/vehicles`))
const transactions = useCollection<Transaction>(collection(db, `users/${userId}/transactions`))
const reminders = useCollection<Reminder>(collection(db, `users/${userId}/reminders`))

const hasVehicles = computed(() => vehicles.value?.length > 0)

const filteredTransactions = computed(() => {
  if (!selectedVehicle.value) return transactions.value
  return transactions.value?.filter(t => t.vehicleId === selectedVehicle.value)
})

const stats = computed<DashboardStats>(() => {
  if (!filteredTransactions.value) return {
    totalExpenses: 0,
    monthlyExpenses: 0,
    expensesByCategory: {} as Record<ExpenseCategory, number>,
    recentTransactions: [],
    upcomingReminders: [],
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return {
    totalExpenses: filteredTransactions.value.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
    monthlyExpenses: filteredTransactions.value
      .filter((t: Transaction) => {
        const date = new Date(t.date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
    expensesByCategory: {} as Record<ExpenseCategory, number>,
    recentTransactions: filteredTransactions.value
      .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    upcomingReminders: reminders.value
      ?.filter((r: Reminder) => !r.isCompleted && new Date(r.dueDate) > new Date())
      .sort((a: Reminder, b: Reminder) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3) || [],
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const navigateToTransaction = (id: string) => {
  router.push(`/transactions/${id}`);
};

const showDeleteDialog = ref(false)
const vehicleToDelete = ref<Vehicle | null>(null)

const handleDeleteVehicle = async (vehicle: Vehicle) => {
  vehicleToDelete.value = vehicle
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!vehicleToDelete.value) return
  
  try {
    await deleteDoc(doc(db, `users/${userId}/vehicles/${vehicleToDelete.value.id}`))
    showDeleteDialog.value = false
    vehicleToDelete.value = null
  } catch (error) {
    console.error('Error deleting vehicle:', error)
  }
}

// Thêm ref để quản lý dropdown
const openDropdownId = ref<string | null>(null)

const toggleDropdown = (vehicleId: string) => {
  if (openDropdownId.value === vehicleId) {
    openDropdownId.value = null
  } else {
    openDropdownId.value = vehicleId
  }
}

// Thêm hàm để đóng dropdown khi click ra ngoài
const closeDropdown = () => {
  openDropdownId.value = null
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <!-- No vehicles message -->
    <div v-if="!hasVehicles" class="text-center py-12">
      <div class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 class="text-2xl font-bold mb-4">Chưa có xe nào</h2>
        <p class="text-gray-600 mb-6">
          Bạn cần thêm ít nhất một xe để bắt đầu theo dõi chi phí.
        </p>
        <button
          @click="router.push('/vehicles/add')"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Thêm xe mới
        </button>
      </div>
    </div>

    <!-- Dashboard content -->
    <template v-else>
      <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-500 text-sm font-medium">Tổng chi phí</h3>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatCurrency(stats.totalExpenses) }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-500 text-sm font-medium">Chi phí tháng này</h3>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatCurrency(stats.monthlyExpenses) }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-500 text-sm font-medium">Số giao dịch</h3>
          <p class="text-2xl font-bold text-gray-900">
            {{ stats.recentTransactions.length }}
          </p>
        </div>
      </div>

      <!-- Vehicle Filter Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div
          @click="selectedVehicle = null"
          class="bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md"
          :class="{ 'ring-2 ring-blue-500': selectedVehicle === null }"
        >
          <h3 class="font-medium text-center">Tất cả xe</h3>
        </div>
        <div
          v-for="vehicle in vehicles"
          :key="vehicle.id"
          class="bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md relative"
          :class="{ 'ring-2 ring-blue-500': selectedVehicle === vehicle.id }"
        >
          <div class="flex justify-between items-center">
            <div @click="selectedVehicle = vehicle.id" class="flex-1">
              <h3 class="font-medium text-center">{{ vehicle.brand }} {{ vehicle.model }}</h3>
            </div>
            <div class="relative">
              <button
                @click.stop="toggleDropdown(vehicle.id)"
                class="p-1 hover:bg-gray-100 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              <div
                v-show="openDropdownId === vehicle.id"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              >
                <div class="py-1">
                  <a
                    @click.stop="router.push(`/vehicles/${vehicle.id}/edit`)"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Chỉnh sửa
                  </a>
                  <a
                    @click.stop="handleDeleteVehicle(vehicle)"
                    class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Xóa
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No transactions message -->
      <div v-if="!transactions.length" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 class="text-xl font-bold mb-4">Chưa có giao dịch nào</h2>
        <p class="text-gray-600 mb-6">
          Hãy thêm giao dịch đầu tiên để bắt đầu theo dõi chi phí của bạn.
        </p>
        <button
          @click="router.push('/transactions/add')"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Thêm giao dịch mới
        </button>
      </div>

      <!-- Chart and Transactions list - only show if there are transactions -->
      <template v-else>
        <!-- Expense Analysis Chart -->
        <div class="bg-white rounded-lg shadow mb-8">
          <div class="p-6">
            <ExpenseAnalysisChart :transactions="transactions" />
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="bg-white rounded-lg shadow mb-8">
          <div class="p-6">
            <h2 class="text-lg font-semibold mb-4">Giao dịch gần đây</h2>
            <div class="space-y-4">
              <div
                v-for="transaction in stats.recentTransactions"
                :key="transaction.id"
                @click="navigateToTransaction(transaction.id)"
                class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div>
                  <p class="font-medium">
                    {{ transaction.description || transaction.category }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(transaction.date) }}
                  </p>
                </div>
                <div
                  :class="{
                    'text-red-600': true,
                  }"
                >
                  {{ formatCurrency(transaction.amount) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Upcoming Reminders -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">Nhắc nhở sắp tới</h2>
          <div class="space-y-4">
            <div
              v-for="reminder in stats.upcomingReminders"
              :key="reminder.id"
              class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
            >
              <div>
                <p class="font-medium">{{ reminder.description }}</p>
                <p class="text-sm text-gray-500">
                  Hạn: {{ formatDate(reminder.dueDate) }}
                </p>
              </div>
              <div class="text-yellow-600">
                {{ reminder.type }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Delete Confirmation Dialog -->
  <div v-if="showDeleteDialog" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-sm mx-auto">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa xe</h3>
      <p class="text-sm text-gray-500 mb-4">
        Bạn có chắc chắn muốn xóa xe {{ vehicleToDelete?.brand }} {{ vehicleToDelete?.model }}? 
        Hành động này không thể hoàn tác.
      </p>
      <div class="flex justify-end space-x-4">
        <button
          @click="showDeleteDialog = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
        >
          Hủy
        </button>
        <button
          @click="confirmDelete"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
</template>
