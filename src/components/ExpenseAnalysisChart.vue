<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { ExpenseCategory } from '../types'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
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
    category: ExpenseCategory
  }>
}>()

const timeRange = ref('month') // 'week', 'month', 'all'

const filteredTransactions = computed(() => {
  const now = new Date()
  const transactions = props.transactions

  switch (timeRange.value) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return transactions.filter(t => new Date(t.date) >= weekAgo)
    case 'month':
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      return transactions.filter(t => new Date(t.date) >= monthAgo)
    default:
      return transactions
  }
})

const chartData = computed(() => {
  const categoryTotals = new Map<string, number>()
  
  filteredTransactions.value.forEach(transaction => {
    const currentTotal = categoryTotals.get(transaction.category) || 0
    categoryTotals.set(transaction.category, currentTotal + transaction.amount)
  })

  return Array.from(categoryTotals.entries()).map(([category, total]) => ({
    name: category,
    value: total
  }))
})

const chartOption = computed(() => ({
  title: {
    text: 'Chi phí theo danh mục',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} VND ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: 'Chi phí',
      type: 'pie',
      radius: '50%',
      data: chartData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))
</script>

<template>
  <div class="expense-analysis">
    <div class="mb-4">
      <select v-model="timeRange" class="px-4 py-2 border rounded-lg">
        <option value="week">Tuần này</option>
        <option value="month">Tháng này</option>
        <option value="all">Tất cả</option>
      </select>
    </div>
    
    <v-chart class="chart" :option="chartOption" />
  </div>
</template>

<style scoped>
.expense-analysis {
  width: 100%;
  padding: 1rem;
}

.chart {
  height: 400px;
  width: 100%;
}
</style> 