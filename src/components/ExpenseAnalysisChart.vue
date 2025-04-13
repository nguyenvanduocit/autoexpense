<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { TransactionCategory, TransactionType } from '../types'
import TimeRangeFilter from './TimeRangeFilter.vue'
import type { TimeRange } from '../types'
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
])

const props = defineProps<{
  transactions: Array<{
    id: string
    amount: number
    date: string
    description: string
    category: TransactionCategory
    transactionType?: TransactionType
  }>
}>()

const timeRange = ref<TimeRange>('month')
const chartType = ref<'income' | 'expense'>('expense')

const filteredTransactions = computed(() => {
  const now = new Date()
  const transactions = props.transactions

  switch (timeRange.value) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return transactions.filter(t => new Date(t.date) >= weekAgo)
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return transactions.filter(t => {
        const date = new Date(t.date)
        return date >= startOfMonth && date <= endOfMonth
      })
    default:
      return transactions
  }
})

const incomeTransactions = computed(() => {
  return filteredTransactions.value.filter(t =>
    t.transactionType === 'Income' || (!t.transactionType && t.amount > 0)
  )
})

const expenseTransactions = computed(() => {
  return filteredTransactions.value.filter(t =>
    t.transactionType === 'Expense' || (!t.transactionType && t.amount < 0)
  )
})

const chartData = computed(() => {
  const transactions = chartType.value === 'income'
    ? incomeTransactions.value
    : expenseTransactions.value

  const categoryTotals = new Map<string, number>()

  transactions.forEach(transaction => {
    const currentTotal = categoryTotals.get(transaction.category) || 0
    categoryTotals.set(transaction.category, currentTotal + Math.abs(transaction.amount))
  })

  return Array.from(categoryTotals.entries())
    .filter(([_, total]) => total > 0)
    .map(([category, total]) => ({
      name: category,
      value: total
    }))
})

const chartTitle = computed(() =>
  chartType.value === 'income' ? 'Thu nhập theo danh mục' : 'Chi phí theo danh mục'
)

const chartColors = computed(() =>
  chartType.value === 'income'
    ? ['#34D399', '#10B981', '#059669', '#047857', '#065F46', '#064E3B'] // Green colors
    : ['#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'] // Red colors
)

const chartOption = computed(() => ({
  title: {
    text: chartTitle.value,
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} VND ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    left: 'center',
    top: 'bottom'
  },
  color: chartColors.value,
  series: [
    {
      name: chartTitle.value,
      type: 'pie',
      radius: ['40%', '70%'], // Donut chart
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: chartData.value
    }
  ]
}))

const toggleChartType = () => {
  chartType.value = chartType.value === 'income' ? 'expense' : 'income'
}
</script>

<template>
  <div class="expense-analysis">
    <div class="p-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button @click="toggleChartType" class="px-3 py-1 rounded-md text-sm font-medium"
          :class="chartType === 'expense' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'">
          Chi phí
        </button>
        <button @click="toggleChartType" class="px-3 py-1 rounded-md text-sm font-medium"
          :class="chartType === 'income' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
          Thu nhập
        </button>
      </div>
      <TimeRangeFilter v-model="timeRange" />
    </div>

    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<style scoped>
.expense-analysis {
  width: 100%;
  height: 400px;
}

.chart {
  width: 100%;
  height: calc(100% - 61px);
}
</style> 