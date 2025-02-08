import * as functions from "firebase-functions/v1";
import { db } from ".";

const setBudget = functions.https.onCall(
  async (data, context) => {
    const {
      uid,
      budgets,
      totalMonthlyBudget,
      savingsGoal,
    } = data;

    if (!uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User ID is required"
      );
    }

    if (!budgets || !Array.isArray(budgets)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Budgets array is required"
      );
    }

    if (
      typeof totalMonthlyBudget !== "number" ||
      totalMonthlyBudget < 0
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Total monthly budget must be a non-negative number"
      );
    }

    if (
      typeof savingsGoal !== "number" ||
      savingsGoal < 0
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Savings goal must be a non-negative number"
      );
    }

    try {
      const budgetDocRef = db
        .collection("budgets")
        .doc(uid);

      await budgetDocRef.set({
        uid,
        totalMonthlyBudget,
        savingsGoal,
        budgets,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error(
        "Error setting budget:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Error setting budget",
        error
      );
    }
  }
);

export default setBudget;
