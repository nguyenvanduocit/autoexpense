import { auth } from "../config/firebase";
import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(!!user);
      });
    });
  },

  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        reject
      );
    });
  },
};
