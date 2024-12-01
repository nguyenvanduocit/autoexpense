<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Props {
  title: string
  message: string
  buttonText: string
  buttonLink: string
  bgColor?: string
  borderColor?: string
}

defineProps<Props>()
const router = useRouter();
</script>

<template>
  <div :class="`mb-6 p-4 rounded-lg border ${bgColor || 'bg-blue-50'} ${borderColor || 'border-blue-200'}`">
    <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
    <p class="text-gray-600 mb-6">
      {{ message }}
    </p>
    <button
      @click="router.push(buttonLink)"
      class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {{ buttonText }}
    </button>
  </div>
</template> 