import { TransactionCategory, Transaction, TransactionType } from "../types";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";

interface ParsedTransaction {
  description: string;
  amount: number;
  date: string;
  category: TransactionCategory;
  transactionType: TransactionType;
}

// Helper function to normalize transaction data
const normalizeTransaction = (item: any): ParsedTransaction => {
  // Convert relative dates to ISO format
  let date = new Date();
  if (item.date.toLowerCase() === "yesterday") {
    date.setDate(date.getDate() - 1);
  } else if (item.date.toLowerCase() === "tomorrow") {
    date.setDate(date.getDate() + 1);
  } else if (item.date.toLowerCase() === "today" || item.date.toLowerCase() === "this morning") {
    // already set to today
  } else if (item.date.toLowerCase().includes("monday")) {
    // Find the previous or next Monday
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    date.setDate(date.getDate() + diff);
  }
  // TODO: Add more date parsing logic as needed

  // Ensure the category is valid
  let category = item.category as TransactionCategory;
  if (!Object.values(TransactionCategory).includes(category)) {
    category = TransactionCategory.Other;
  }

  // Determine transaction type (default to Expense if not specified)
  let transactionType = item.transactionType as TransactionType;
  if (!Object.values(TransactionType).includes(transactionType)) {
    // Infer transaction type from category if possible
    if ([TransactionCategory.ServiceIncome].includes(category)) {
      transactionType = TransactionType.Income;
    } else {
      transactionType = TransactionType.Expense;
    }
  }

  return {
    description: item.description,
    amount: parseFloat(item.amount.toString().replace(/[$,]/g, '')),
    date: date.toISOString().split('T')[0],
    category,
    transactionType
  };
};

export const transactionService = {
  async parseTransactions(text: string): Promise<ParsedTransaction[]> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.openai.com/v1';
      
      // Get the userId
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Get API key from user settings in Firestore
      const apiKeyDoc = await getDoc(doc(db, `users/${userId}/settings/openAIKey`));
      const apiKey = apiKeyDoc.exists() ? apiKeyDoc.data().key : '';
      
      // Fallback to environment variable only if not found in settings
      const fallbackApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
      const effectiveApiKey = apiKey || fallbackApiKey;

      if (!effectiveApiKey) {
        throw new Error("API key not configured. Please set your OpenAI API key in Settings.");
      }

      // Call API to parse transactions
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Parse the following text into structured transaction data. Extract description, amount (in vietnamese dong), date (relative to today), category (must be one of: ${Object.values(TransactionCategory).join(", ")}), and transaction type (must be one of: ${Object.values(TransactionType).join(", ")}). Return JSON array even if there is only one transaction.`
            },
            {
              role: "user",
              content: text
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to parse transactions");
      }

      const data = await response.json();
      const parsedData = JSON.parse(data.choices[0].message.content);

      // Check if the parsed data has the expected format
      if (!parsedData.transactions || !Array.isArray(parsedData.transactions)) {
        // If the transactions array is missing, try to use the parsed data directly if it's an array
        if (Array.isArray(parsedData)) {
          return parsedData.map(normalizeTransaction);
        } else {
          throw new Error("Invalid response format from API. Expected transactions array.");
        }
      }

      // Normalize the transactions
      return parsedData.transactions.map(normalizeTransaction);
    } catch (error: any) {
      console.error("Error parsing transactions:", error);
      throw new Error(`Failed to parse transactions: ${error.message}`);
    }
  },

  async addBulkTransactions(transactions: Transaction[]): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Add each transaction to Firestore
      const batch = transactions.map(transaction => 
        addDoc(collection(db, `users/${userId}/transactions`), transaction)
      );

      await Promise.all(batch);
    } catch (error: any) {
      console.error("Error adding bulk transactions:", error);
      throw new Error(`Failed to add transactions: ${error.message}`);
    }
  }
}; 