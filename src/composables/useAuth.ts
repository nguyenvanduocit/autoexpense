import { ref, onMounted, onUnmounted } from "vue";
import { auth } from "../config/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { authService } from "../services/auth.service";

export function useAuth() {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(true);

  const updateAuthState = (newUser: User | null) => {
    user.value = newUser;
    isAuthenticated.value = !!newUser;
    isLoading.value = false;
  };

  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = onAuthStateChanged(auth, updateAuthState);
  });

  onUnmounted(() => {
    unsubscribe?.();
  });

  const login = async () => {
    isLoading.value = true;
    try {
      const user = await authService.loginWithGoogle();
      updateAuthState(user);
    } catch (error) {
      isLoading.value = false;
      throw error;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    try {
      await authService.logout();
      updateAuthState(null);
    } catch (error) {
      isLoading.value = false;
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
