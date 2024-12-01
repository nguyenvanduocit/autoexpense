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
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      return transactions.filter(t => new Date(t.date) >= monthAgo)
    default:
      return transactions
  }
})

const chartData = computed(() => {
  const categories = [...new Set(props.transactions.map(t => t.category))]
  const dateMap = new Map<string, Record<ExpenseCategory, number>>()

  filteredTransactions.value.forEach(transaction => {
    const date = new Date(transaction.date).toLocaleDateString()
    const existing = dateMap.get(date) || Object.fromEntries(
      categories.map(c => [c, 0])
    ) as Record<ExpenseCategory, number>
    
    existing[transaction.category] += transaction.amount
    dateMap.set(date, existing)
  })

  const dates = Array.from(dateMap.keys())
  
  return categories.map(category => ({
    name: category,
    type: 'line',
    data: dates.map(date => dateMap.get(date)![category])
  }))
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      let result = `${params[0].axisValue}<br/>`
      params.forEach((param: any) => {
        result += `${param.seriesName}: ${param.value.toLocaleString()} VND<br/>`
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
    data: Array.from(new Set(filteredTransactions.value.map(t => 
      new Date(t.date).toLocaleDateString()
    )))
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
      <div class="time-range-buttons">
        <button 
          @click="timeRange = 'week'"
          :class="['time-btn', timeRange === 'week' ? 'active' : '']"
        >
          Tuần này
        </button>
        <button 
          @click="timeRange = 'month'"
          :class="['time-btn', timeRange === 'month' ? 'active' : '']"
        >
          Tháng này
        </button>
        <button 
          @click="timeRange = 'all'"
          :class="['time-btn', timeRange === 'all' ? 'active' : '']"
        >
          Tất cả
        </button>
      </div>
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

.time-range-buttons {
  display: flex;
  gap: 0.5rem;
}

.time-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background-color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  background-color: #f8fafc;
}

.time-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
</style> 