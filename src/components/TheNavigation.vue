<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import NavLink from './NavLink.vue';

const router = useRouter();
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const navigateTo = (path: string) => {
  router.push(path);
  if (isMobileMenuOpen.value) {
    toggleMobileMenu();
  }
};

const navItems = [
  { path: '/transactions/add', text: '+ Thêm giao dịch', variant: 'primary' },
  { path: '/settings', text: 'Cài đặt', variant: 'secondary', icon: 'settings' }
];
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-xl font-bold text-gray-900">
              AutoExpense
            </router-link>
          </div>
        </div>
        
        <!-- Desktop menu -->
        <div class="hidden md:flex items-center space-x-4">
          <NavLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            :variant="item.variant"
            :icon="item.icon"
          >
            {{ item.text }}
          </NavLink>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button
            @click="toggleMobileMenu"
            class="mobile-menu-button"
          >
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="!isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden bg-white border-t border-gray-200 py-2"
    >
      <div class="px-4 space-y-2">
        <button
          v-for="item in navItems"
          :key="item.path"
          @click="navigateTo(item.path)"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          {{ item.text }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.mobile-menu-button {
  @apply inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500;
}
</style> 