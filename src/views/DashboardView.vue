<script setup lang="ts">
import { ref, computed } from "vue";
import { useCollection } from 'vuefire'
import { collection, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useStorage } from '@vueuse/core'
import type { Transaction, DashboardStats, ExpenseCategory, Vehicle, Reminder } from "../types";
import { useRouter } from "vue-router";
import ExpenseAnalysisChart from "../components/ExpenseAnalysisChart.vue";
import { auth } from "../config/firebase";

// Import new components
import StatsCards from "../components/dashboard/StatsCards.vue";
import VehicleFilter from "../components/dashboard/VehicleFilter.vue";
import RecentTransactions from "../components/dashboard/RecentTransactions.vue";
import DeleteVehicleDialog from "../components/dashboard/DeleteVehicleDialog.vue";
import NoVehiclesMessage from "../components/dashboard/NoVehiclesMessage.vue";
import NoTransactionsMessage from "../components/dashboard/NoTransactionsMessage.vue";
import ExpenseTimelineChart from "../components/ExpenseTimelineChart.vue";
import ExpenseHeatmapChart from "../components/ExpenseHeatmapChart.vue";

const router = useRouter();
const db = useFirestore()
const userId = auth.currentUser?.uid

const selectedVehicle = useStorage<string | null>('selected-vehicle', null)

// Use VueFire's useCollection to get realtime data
const { data: vehicles, pending: vehiclesPending } = useCollection<Vehicle>(collection(db, `users/${userId}/vehicles`))
const transactions = useCollection<Transaction>(collection(db, `users/${userId}/transactions`))
const reminders = useCollection<Reminder>(collection(db, `users/${userId}/reminders`))

const isLoading = computed(() => vehiclesPending.value)

const hasVehicles = computed(() => {
  if (isLoading.value) return true
  return vehicles.value?.length > 0
})

const filteredTransactions = computed(() => {
  if (!selectedVehicle.value) return transactions.value
  return transactions.value?.filter(t => t.vehicleId === selectedVehicle.value)
})

const currentPage = ref(1);
const itemsPerPage = 5;

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
      .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    upcomingReminders: reminders.value
      ?.filter((r: Reminder) => !r.isCompleted && new Date(r.dueDate) > new Date())
      .sort((a: Reminder, b: Reminder) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3) || [],
  }
})

const showDeleteDialog = ref(false)
const vehicleToDelete = ref<Vehicle | null>(null)

const handleDeleteVehicle = async (vehicle: Vehicle) => {
  vehicleToDelete.value = vehicle
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!vehicleToDelete.value) return
  
  try {
    // 1. Xóa tất cả transactions của vehicle này
    const vehicleTransactionsRef = collection(db, `users/${userId}/transactions`)
    const q = query(vehicleTransactionsRef, where("vehicleId", "==", vehicleToDelete.value.id))
    const querySnapshot = await getDocs(q)
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    )
    await Promise.all(deletePromises)

    // 2. Xóa vehicle
    await deleteDoc(doc(db, `users/${userId}/vehicles/${vehicleToDelete.value.id}`))
    
    showDeleteDialog.value = false
    vehicleToDelete.value = null
  } catch (error) {
    console.error('Error deleting vehicle and its transactions:', error)
  }
}

const navigateToTransaction = (id: string) => {
  router.push(`/transactions/${id}`);
};

const handlePageUpdate = (page: number) => {
  currentPage.value = page;
};
</script>

<template>
  <div class="p-4 sm:p-6 max-w-5xl mx-auto">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col justify-center items-center min-h-[200px] gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p class="text-gray-600 text-lg">Loading...</p>
    </div>

    <!-- No vehicles message -->
    <NoVehiclesMessage v-else-if="!hasVehicles" />

    <!-- Dashboard content -->
    <template v-else>

      <!-- Stats Cards -->
      <StatsCards :stats="stats" />

      <!-- Vehicle Filter -->
      <VehicleFilter
        :vehicles="vehicles"
        v-model:selectedVehicleId="selectedVehicle"
        @deleteVehicle="handleDeleteVehicle"
      />

      <!-- No transactions message -->
      <NoTransactionsMessage v-if="!transactions.length" />

      <!-- Chart and Transactions list - only show if there are transactions -->
      <template v-else>
        <!-- Charts Section -->
        <div class="flex flex-col lg:flex-row gap-4 sm:gap-8 mb-8">
          <!-- Expense Timeline Chart -->
          <div class="bg-white rounded-lg shadow w-full lg:w-[60%]">
            <ExpenseTimelineChart :transactions="filteredTransactions" />
          </div>

          <!-- Expense Analysis Chart -->
          <div class="bg-white rounded-lg shadow w-full lg:w-[40%]">
            <ExpenseAnalysisChart :transactions="filteredTransactions" />
          </div>
        </div>

        <!-- Expense Heatmap -->
        <div class="bg-white rounded-lg shadow w-full mb-8">
          <ExpenseHeatmapChart :transactions="filteredTransactions" />
        </div>

        <!-- Recent Transactions -->
        <RecentTransactions
          :transactions="stats.recentTransactions"
          :current-page="currentPage"
          :items-per-page="itemsPerPage"
          @click="navigateToTransaction"
          @update-page="handlePageUpdate"
        />
      </template>
    </template>
  </div>

  <!-- Delete Confirmation Dialog -->
  <DeleteVehicleDialog
    :show="showDeleteDialog"
    :vehicle="vehicleToDelete"
    @close="showDeleteDialog = false"
    @confirm="confirmDelete"
  />
</template>
