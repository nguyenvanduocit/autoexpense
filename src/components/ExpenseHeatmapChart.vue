<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { HeatmapChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  CalendarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { TransactionCategory } from '../types'
import { TransactionType } from '../types'

use([
  CanvasRenderer,
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  VisualMapComponent,
  CalendarComponent
])

const props = defineProps<{
  transactions: Array<{
    id: string
    amount: number | null
    date: string
    category: TransactionCategory
    transactionType: TransactionType
  }>
}>()

const viewMode = ref<'all' | 'income' | 'expense'>('all')

const filteredTransactions = computed(() => {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  
  return props.transactions
    .filter(t => t.amount !== null && t.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter(t => new Date(t.date) >= threeMonthsAgo)
})

const incomeTransactions = computed(() => {
  return filteredTransactions.value.filter(t =>
    t.amount !== null && t.transactionType === TransactionType.Income
  )
})

const expenseTransactions = computed(() => {
  return filteredTransactions.value.filter(t =>
    t.amount !== null && t.transactionType === TransactionType.Expense
  )
})

const chartData = computed(() => {
  let transactionsToUse: typeof filteredTransactions.value

  switch (viewMode.value) {
    case 'income':
      transactionsToUse = incomeTransactions.value
      break
    case 'expense':
      transactionsToUse = expenseTransactions.value
      break
    default:
      transactionsToUse = filteredTransactions.value
  }

  const dailyTotals = new Map<string, number>()

  transactionsToUse.forEach(transaction => {
    if (transaction.amount === null) return

    const date = new Date(transaction.date).toISOString().split('T')[0]
    const currentTotal = dailyTotals.get(date) || 0

    // For all transactions, use absolute value for better visualization
    const amount = transaction.transactionType === TransactionType.Expense ?
      Math.abs(transaction.amount) : transaction.amount

    dailyTotals.set(date, currentTotal + amount)
  })

  return Array.from(dailyTotals.entries()).map(([date, total]) => [
    date,
    Math.round(total) // Round to avoid floating point precision issues
  ])
})

const getDateRange = computed(() => {
  const now = new Date()
  // Get first day of 3 months ago
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  // Get last day of current month
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
})

const maxValue = computed(() => {
  if (chartData.value.length === 0) return 1000

  const values = chartData.value.map(item => {
    const value = Number(item[1])
    return isNaN(value) ? 0 : value
  })
  return Math.max(...values, 1000) // Ensure we have a minimum max value
})

const colorRange = computed(() => {
  switch (viewMode.value) {
    case 'income':
      return ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'] // Green shades
    case 'expense':
      return ['#ebedf0', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'] // Red shades
    default:
      return ['#ebedf0', '#9ecae1', '#3182bd', '#08519c', '#082850'] // Blue shades
  }
})

const chartTitle = computed(() => {
  switch (viewMode.value) {
    case 'income':
      return 'Daily Income Chart'
    case 'expense':
      return 'Daily Expense Chart'
    default:
      return 'Financial Activity Chart'
  }
})

const chartOption = computed(() => {
  return {
    title: {
      text: chartTitle.value,
      left: 'center'
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        if (!params.value) return '';

        const value = params.value[1]
        const formattedValue = value.toLocaleString('vi-VN')
        if (viewMode.value === 'income') {
          return `${params.value[0]}<br/>Income: ${formattedValue} VND`
        } else if (viewMode.value === 'expense') {
          return `${params.value[0]}<br/>Expense: ${formattedValue} VND`
        } else {
          return `${params.value[0]}<br/>Activity: ${formattedValue} VND`
        }
      }
    },
    visualMap: {
      min: 0,
      max: maxValue.value,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 30,
      inRange: {
        color: colorRange.value
      }
    },
    calendar: {
      top: 100,
      left: 40,
      right: 40,
      cellSize: ['auto', 25],
      range: getDateRange.value,
      itemStyle: {
        borderWidth: 0.5
      },
      yearLabel: { show: false },
      dayLabel: {
        nameMap: 'vi'
      }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: chartData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  }
})
</script>

<template>
  <div class="expense-heatmap">
    <div class="flex items-center justify-center mb-4 gap-4">
      <button @click="viewMode = 'all'" class="px-3 py-1 rounded-md text-sm font-medium"
        :class="viewMode === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'">
        All
      </button>
      <button @click="viewMode = 'income'" class="px-3 py-1 rounded-md text-sm font-medium"
        :class="viewMode === 'income' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
        Income
      </button>
      <button @click="viewMode = 'expense'" class="px-3 py-1 rounded-md text-sm font-medium"
        :class="viewMode === 'expense' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'">
        Expenses
      </button>
    </div>

    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<style scoped>
.expense-heatmap {
  width: 100%;
  height: 300px;
  padding-top: 1rem;
}

.chart {
  width: 100%;
  height: 100%;
}
</style> 