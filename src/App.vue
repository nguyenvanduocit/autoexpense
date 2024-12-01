<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import { useAuth } from "./composables/useAuth";
import { useVehicles } from "./composables/useVehicles";
import LoginView from "./views/LoginView.vue";

const router = useRouter();
const { isAuthenticated, logout } = useAuth();
const { hasVehicles } = useVehicles();

const handleLogout = async () => {
  await logout();
  router.push("/");
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-gray-900">
                VanHanhXe
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="isAuthenticated">
              <button
                @click="router.push('/vehicles/add')"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Thêm xe
              </button>
              <button
                v-if="hasVehicles"
                @click="router.push('/transactions/add')"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Thêm giao dịch
              </button>
              <button
                @click="handleLogout"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Đăng xuất
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main>
      <RouterView v-if="isAuthenticated" />
      <LoginView v-else />
    </main>
  </div>
</template>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
