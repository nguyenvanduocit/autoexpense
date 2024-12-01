<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/auth.service";

const error = ref("");
const router = useRouter();

const handleGoogleLogin = async () => {
  try {
    error.value = "";
    await authService.loginWithGoogle();
    router.push("/");
  } catch (err: any) {
    error.value = err.message;
  }
};
</script>

<template>
  <div class="login-form">
    <div class="space-y-4">
      <div v-if="error" class="text-red-500 text-sm">
        {{ error }}
      </div>

      <button
        @click="handleGoogleLogin"
        class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          class="w-5 h-5"
        />
        Đăng nhập bằng Google
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
