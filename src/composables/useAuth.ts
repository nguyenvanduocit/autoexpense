import { ref, onMounted, onUnmounted } from "vue";
import { auth } from "../config/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { authService } from "../services/auth.service";

export function useAuth() {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);

  const updateAuthState = (newUser: User | null) => {
    user.value = newUser;
    isAuthenticated.value = !!newUser;
  };

  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = onAuthStateChanged(auth, updateAuthState);
  });

  onUnmounted(() => {
    unsubscribe?.();
  });

  const login = async () => {
    const user = await authService.loginWithGoogle();
    updateAuthState(user);
  };

  const logout = async () => {
    await authService.logout();
    updateAuthState(null);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
