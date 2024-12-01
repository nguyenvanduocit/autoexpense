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
import type { ExpenseCategory } from '../types'
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
    category: ExpenseCategory
  }>
}>()

const timeRange = ref<TimeRange>('month')

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
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} VND ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    left: 'center',
    top: 'top'
  },
  series: [
    {
      name: 'Chi phí theo danh mục',
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
    <div class="p-4">
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