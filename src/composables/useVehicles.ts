import { ref, onMounted } from "vue";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { useAuth } from "./useAuth";

export function useVehicles() {
  const hasVehicles = ref(false);
  const { isAuthenticated } = useAuth();

  const checkVehicles = async () => {
    if (!isAuthenticated.value) {
      hasVehicles.value = false;
      return;
    }

    try {
      const db = getFirestore();
      const vehiclesSnapshot = await getDocs(collection(db, "vehicles"));
      hasVehicles.value = !vehiclesSnapshot.empty;
    } catch (error) {
      console.error("Error checking vehicles:", error);
      hasVehicles.value = false;
    }
  };

  onMounted(() => {
    checkVehicles();
  });

  return {
    hasVehicles,
    checkVehicles,
  };
}
