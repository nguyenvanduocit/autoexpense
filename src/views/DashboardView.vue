<script setup lang="ts">
import { ref, onMounted } from "vue";
import { StorageService } from "../services/storage.service";
import type { Transaction, DashboardStats, ExpenseCategory } from "../types";
import { useRouter } from "vue-router";
import ExpenseAnalysisChart from "../components/ExpenseAnalysisChart.vue";

const router = useRouter();
const stats = ref<DashboardStats>({
  totalExpenses: 0,
  monthlyExpenses: 0,
  expensesByCategory: {} as Record<ExpenseCategory, number>,
  recentTransactions: [],
  upcomingReminders: [],
});

const transactions = ref<Transaction[]>([]);
const hasVehicles = ref(false);

const calculateStats = async () => {
  const vehicles = await StorageService.getAllVehicles();
  hasVehicles.value = vehicles.length > 0;

  if (!hasVehicles.value) return;

  transactions.value = await StorageService.getAllTransactions();
  const reminders = await StorageService.getAllReminders();

  // Calculate total expenses
  stats.value.totalExpenses = transactions.value.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Calculate monthly expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  stats.value.monthlyExpenses = transactions.value
    .filter((t) => {
      const date = new Date(t.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Get recent transactions
  stats.value.recentTransactions = transactions.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get upcoming reminders
  stats.value.upcomingReminders = reminders
    .filter((r) => !r.isCompleted && new Date(r.dueDate) > new Date())
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 3);
};

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

onMounted(async () => {
  await calculateStats();
});
</script>

<template>
  <div class="p-6">
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
</template>
