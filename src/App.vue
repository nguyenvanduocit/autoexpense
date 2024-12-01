<script setup lang="ts">
import { RouterView } from "vue-router";
import { useAuth } from "./composables/useAuth";
import LoginView from "./views/LoginView.vue";
import TheNavigation from "./components/TheNavigation.vue";

const { isAuthenticated, isLoading } = useAuth();
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <TheNavigation v-if="isAuthenticated" />

    <main>
      <template v-if="!isLoading">
        <RouterView v-if="isAuthenticated" />
        <LoginView v-else />
      </template>
      <div v-else class="flex justify-center items-center h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </main>
  </div>
</template>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
