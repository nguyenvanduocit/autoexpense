<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
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
  LineChart,
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
    category: TransactionCategory
    transactionType?: TransactionType
  }>
}>()

const timeRange = ref<TimeRange>('quarter')

const filteredTransactions = computed(() => {
  const now = new Date()
  const transactions = [...props.transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

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
    case 'quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1)
      const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0)
      return transactions.filter(t => {
        const date = new Date(t.date)
        return date >= startOfQuarter && date <= endOfQuarter
      })
    default:
      return transactions
  }
})

const chartData = computed(() => {
  // Group by transaction type and category
  const incomeTransactions = filteredTransactions.value.filter(t =>
    t.transactionType === 'Income' || (!t.transactionType && t.amount > 0)
  )

  const expenseTransactions = filteredTransactions.value.filter(t =>
    t.transactionType === 'Expense' || (!t.transactionType && t.amount < 0)
  )

  // Get all dates for the x-axis
  const dateSet = new Set<string>()
  filteredTransactions.value.forEach(t => {
    if (t && t.date) {
      dateSet.add(new Date(t.date).toLocaleDateString(navigator.language))
    }
  })
  const dates = Array.from(dateSet).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  )

  // Process income by date
  const incomeSeries = {
    name: 'Thu nhập',
    type: 'line',
    stack: 'total',
    areaStyle: {},
    emphasis: { focus: 'series' },
    lineStyle: { width: 2 },
    itemStyle: { color: '#34D399' }, // Green color
    data: dates.map(date => {
      const dayIncome = incomeTransactions
        .filter(t => new Date(t.date).toLocaleDateString(navigator.language) === date)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return dayIncome || 0
    })
  }

  // Process expense by date
  const expenseSeries = {
    name: 'Chi phí',
    type: 'line',
    stack: 'total',
    areaStyle: {},
    emphasis: { focus: 'series' },
    lineStyle: { width: 2 },
    itemStyle: { color: '#F87171' }, // Red color
    data: dates.map(date => {
      const dayExpense = expenseTransactions
        .filter(t => new Date(t.date).toLocaleDateString(navigator.language) === date)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return dayExpense || 0
    })
  }

  // Process net balance by date
  const balanceSeries = {
    name: 'Số dư',
    type: 'line',
    emphasis: { focus: 'series' },
    lineStyle: { width: 3, type: 'dashed' },
    itemStyle: { color: '#60A5FA' }, // Blue color
    data: dates.map(date => {
      const dayIncome = incomeTransactions
        .filter(t => new Date(t.date).toLocaleDateString(navigator.language) === date)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const dayExpense = expenseTransactions
        .filter(t => new Date(t.date).toLocaleDateString(navigator.language) === date)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return dayIncome - dayExpense
    })
  }

  return [incomeSeries, expenseSeries, balanceSeries]
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      if (!params || !params.length) return ''

      let result = `${params[0].axisValue}<br/>`
      params.forEach((param: any) => {
        if (param && param.value !== null) {
          result += `${param.seriesName}: ${param.value?.toLocaleString(navigator.language) || 0} VND<br/>`
        }
      })
      return result
    }
  },
  legend: {
    data: ['Thu nhập', 'Chi phí', 'Số dư'],
    orient: 'horizontal',
    top: 0
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: Array.from(new Set(filteredTransactions.value
      .filter(t => t && t.date)
      .map(t => new Date(t.date).toLocaleDateString(navigator.language))
    )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  },
  yAxis: {
    type: 'value'
  },
  series: chartData.value
}))
</script>

<template>
  <div class="expense-timeline">
    <div class="p-4 flex items-center justify-between">
      <h3 class="text-lg font-medium">Biểu đồ thu chi theo thời gian</h3>
      <TimeRangeFilter v-model="timeRange" />
    </div>

    <v-chart class="chart" :option="chartOption" autoresize />
  </div>
</template>

<style scoped>
.expense-timeline {
  width: 100%;
  height: 400px;
}

.chart {
  width: 100%;
  height: calc(100% - 61px);
}
</style> 