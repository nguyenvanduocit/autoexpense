<script setup lang="ts">
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, addDoc } from 'firebase/firestore'
import { ExpenseCategory } from '../../types'
import { auth } from '../../config/firebase'
import { convertAmount } from '../../utils/currency'

const props = defineProps<{
  vehicleId: string
}>()

const emit = defineEmits<{
  (e: 'added'): void
  (e: 'cancel'): void
}>()

const db = useFirestore()
const userId = auth.currentUser?.uid

const amount = ref('')
const category = ref<ExpenseCategory>(ExpenseCategory.Fuel)

const categories: ExpenseCategory[] = [
  ExpenseCategory.Fuel,
  ExpenseCategory.Maintenance,
  ExpenseCategory.Insurance,
  ExpenseCategory.Parking,
  ExpenseCategory.Other
]

const handleAmountBlur = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    const convertedAmount = convertAmount(target.value);
    amount.value = convertedAmount.toString();
  }
};

const handleSubmit = async () => {
  if (!amount.value) return

  try {
    await addDoc(collection(db, `users/${userId}/transactions`), {
      amount: Number(amount.value),
      category: category.value,
      date: new Date().toISOString(),
      vehicleId: props.vehicleId,
      notes: ''
    })
    
    amount.value = ''
    emit('added')
  } catch (error) {
    console.error('Error adding transaction:', error)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 mb-6">
    <h3 class="text-lg font-medium mb-4">Quick Add Transaction</h3>
    <form @submit.prevent="handleSubmit" class="flex flex-wrap gap-4">
      <div class="flex-1 min-w-[120px]">
        <input
          v-model="amount"
          type="text"
          placeholder="Amount"
          @blur="handleAmountBlur"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          required
        >
      </div>
      <div class="w-auto min-w-[120px]">
        <select
          v-model="category"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase() }}
          </option>
        </select>
      </div>
      <div class="flex gap-2">
        <button
          type="submit"
          class="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
        >
          Add
        </button>
      </div>
    </form>
  </div>
</template> 