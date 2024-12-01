<script setup lang="ts">
import {  computed } from 'vue'
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
import type { ExpenseCategory } from '../types'

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
    category: ExpenseCategory
  }>
}>()

const filteredTransactions = computed(() => {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
  return [...props.transactions]
    .filter(t => t.amount !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter(t => new Date(t.date) >= threeMonthsAgo)
})

const chartData = computed(() => {
  const dailyTotals = new Map<string, number>()

  filteredTransactions.value.forEach(transaction => {
    if (transaction.amount === null) return
    
    const date = new Date(transaction.date).toISOString().split('T')[0]
    const currentTotal = dailyTotals.get(date) || 0
    dailyTotals.set(date, currentTotal + transaction.amount)
  })

  return Array.from(dailyTotals.entries()).map(([date, total]) => [
    date,
    total
  ])
})

const getDateRange = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
})

const maxValue = computed(() => {
  const values = chartData.value.map(item => {
    const value = Number(item[1])
    return isNaN(value) ? 0 : value
  })
  return Math.max(...values) || 1
})

const chartOption = computed(() => {
  if (props.transactions.length === 0) {
    return {
      tooltip: {
        show: false
      },
      visualMap: {
        show: false
      },
      calendar: {
        top: 80,
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
        data: []
      }
    }
  }

  return {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const value = params.value[1]
        return `${params.value[0]}<br/>Chi tiêu: ${value.toLocaleString()} VND`
      }
    },
    visualMap: {
      min: 0,
      max: maxValue.value,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 'top',
      inRange: {
        color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
      }
    },
    calendar: {
      top: 80,
      left: 40,
      right: 40,
      range: getDateRange.value,
      itemStyle: {
        borderWidth: 0.5
      },
      yearLabel: { show: false },
      dayLabel: {
        show: false
      }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: chartData.value
    }
  }
})
</script>

<template>
  <div class="expense-heatmap">
    <v-chart 
      class="chart" 
      :option="chartOption" 
      autoresize
    />
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