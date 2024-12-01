import { Transaction, Vehicle, Reminder } from "../types";
import { db, auth } from "../config/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const COLLECTIONS = {
  TRANSACTIONS: "transactions",
  VEHICLES: "vehicles",
  REMINDERS: "reminders",
};

export class StorageService {
  private static getCurrentUserId(): string {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user.uid;
  }

  private static getCollectionRef(collectionName: string) {
    return collection(db, `users/${this.getCurrentUserId()}/${collectionName}`);
  }

  // Transactions
  static async getAllTransactions(): Promise<Transaction[]> {
    try {
      const querySnapshot = await getDocs(
        this.getCollectionRef(COLLECTIONS.TRANSACTIONS)
      );
      if (!querySnapshot || querySnapshot.empty) return [];
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
      );
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  }

  static async addTransaction(
    transaction: Omit<Transaction, "id">
  ): Promise<void> {
    if (!transaction) throw new Error("Transaction data is required");
    // ensure transaction id is not set
    const { id, ...cleanTransaction } = transaction as any;
    await addDoc(
      this.getCollectionRef(COLLECTIONS.TRANSACTIONS),
      cleanTransaction
    );
  }

  static async updateTransaction(transaction: Transaction): Promise<void> {
    if (!transaction || !transaction.id)
      throw new Error("Invalid transaction data");
    const docRef = doc(
      db,
      `users/${this.getCurrentUserId()}/${COLLECTIONS.TRANSACTIONS}/${
        transaction.id
      }`
    );
    const { id, ...cleanTransaction } = transaction as any;
    await updateDoc(docRef, { ...cleanTransaction });
  }

  static async deleteTransaction(id: string): Promise<void> {
    if (!id) throw new Error("Transaction ID is required");
    const docRef = doc(
      db,
      `users/${this.getCurrentUserId()}/${COLLECTIONS.TRANSACTIONS}/${id}`
    );
    await deleteDoc(docRef);
  }

  static async getTransactionById(
    id: string
  ): Promise<Transaction | undefined> {
    if (!id) throw new Error("Transaction ID is required");
    const docRef = doc(
      db,
      `users/${this.getCurrentUserId()}/${COLLECTIONS.TRANSACTIONS}/${id}`
    );
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as Transaction)
      : undefined;
  }

  // Vehicles
  static async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const querySnapshot = await getDocs(
        this.getCollectionRef(COLLECTIONS.VEHICLES)
      );
      if (!querySnapshot || querySnapshot.empty) return [];
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Vehicle)
      );
    } catch (error) {
      console.error("Error getting vehicles:", error);
      return [];
    }
  }

  static async addVehicle(vehicle: Omit<Vehicle, "id">): Promise<void> {
    if (!vehicle) throw new Error("Vehicle data is required");
    const { id, ...cleanVehicle } = vehicle as any;

    await addDoc(this.getCollectionRef(COLLECTIONS.VEHICLES), cleanVehicle);
  }

  static async updateVehicle(vehicle: Vehicle): Promise<void> {
    if (!vehicle || !vehicle.id) throw new Error("Invalid vehicle data");
    const docRef = doc(
      db,
      `users/${this.getCurrentUserId()}/${COLLECTIONS.VEHICLES}/${vehicle.id}`
    );
    const { id, ...cleanVehicle } = vehicle as any;
    await updateDoc(docRef, { ...cleanVehicle });
  }

  static async getVehicleById(id: string): Promise<Vehicle | undefined> {
    if (!id) throw new Error("Vehicle ID is required");
    const docRef = doc(
      db,
      `users/${this.getCurrentUserId()}/${COLLECTIONS.VEHICLES}/${id}`
    );
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as Vehicle)
      : undefined;
  }

  // Reminders
  static async getAllReminders(): Promise<Reminder[]> {
    try {
      const querySnapshot = await getDocs(
        this.getCollectionRef(COLLECTIONS.REMINDERS)
      );
      if (!querySnapshot || querySnapshot.empty) return [];
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Reminder)
      );
    } catch (error) {
      console.error("Error getting reminders:", error);
      return [];
    }
  }

  static async addReminder(reminder: Omit<Reminder, "id">): Promise<void> {
    if (!reminder) throw new Error("Reminder data is required");
    await addDoc(this.getCollectionRef(COLLECTIONS.REMINDERS), reminder);
  }

  static async updateReminder(reminder: Reminder): Promise<void> {
    if (!reminder || !reminder.id) throw new Error("Invalid reminder data");
    const docRef = doc(
      db,
      `users/${this.getCurrentUserId()}/${COLLECTIONS.REMINDERS}/${reminder.id}`
    );
    await updateDoc(docRef, { ...reminder });
  }
}
