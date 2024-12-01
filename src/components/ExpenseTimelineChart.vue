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
import type { ExpenseCategory } from '../types'
import TimeRangeFilter from './TimeRangeFilter.vue'

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
    category: ExpenseCategory
  }>
}>()

const timeRange = ref('month') // 'week', 'month', 'all'

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
    default:
      return transactions
  }
})

const chartData = computed(() => {
  const categories = [...new Set(props.transactions.map(t => t.category))]
  const dateMap = new Map<string, Record<ExpenseCategory, number>>()

  filteredTransactions.value
    .filter(transaction => transaction && transaction.date && transaction.category)
    .forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString()
      const existing = dateMap.get(date) || Object.fromEntries(
        categories.map(c => [c, 0])
      ) as Record<ExpenseCategory, number>
      
      existing[transaction.category] += transaction.amount || 0
      dateMap.set(date, existing)
    })

  const dates = Array.from(dateMap.keys())
  
  return categories.map(category => ({
    name: category,
    type: 'line',
    connectNulls: true,
    data: dates.map(date => {
      const categoryData = dateMap.get(date)
      if (!categoryData) return null
      const value = categoryData[category]
      return value > 0 ? value : null
    })
  }))
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      if (!params || !params.length) return ''
      
      let result = `${params[0].axisValue}<br/>`
      params.forEach((param: any) => {
        if (param && param.value !== null) {
          result += `${param.seriesName}: ${param.value?.toLocaleString() || 0} VND<br/>`
        }
      })
      return result
    }
  },
  legend: {
    data: [...new Set(props.transactions.map(t => t.category))],
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
      .map(t => new Date(t.date).toLocaleDateString())
    ))
  },
  yAxis: {
    type: 'value'
  },
  series: chartData.value
}))
</script>

<template>
  <div class="expense-timeline">
    <div class="mb-4">
      <TimeRangeFilter v-model="timeRange" />
    </div>
    
    <v-chart class="chart" :option="chartOption" />
  </div>
</template>

<style scoped>
.expense-timeline {
  width: 100%;
  padding: 1rem;
}

.chart {
  height: 400px;
  width: 100%;
}
</style> 