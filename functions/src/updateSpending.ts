import * as functions from "firebase-functions/v1";
import { db } from ".";

const updateSpending = functions.https.onCall(
  async (data, context) => {
    const {
      spendingId,
      category,
      subCategory,
      date,
      sum,
      note,
      year,
      month,
    } = data;

    if (!spendingId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Spending ID is required"
      );
    }

    try {
      const spendingRef = db
        .collection("spendings")
        .doc(spendingId);

      const spendingDoc = await spendingRef.get();
      if (!spendingDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Spending not found"
        );
      }

      await spendingRef.update({
        category,
        subCategory,
        date: new Date(date),
        sum,
        note: note || "",
        year,
        month,
      });

      return { success: true };
    } catch (error) {
      console.error(
        "Error updating spending:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Error updating spending",
        error
      );
    }
  }
);

export default updateSpending;
