import * as functions from "firebase-functions/v1";
import { db } from ".";
import { Timestamp } from "firebase-admin/firestore";

const monthsList: { [key: number]: string } = {
  1: "ינואר",
  2: "פברואר",
  3: "מרץ",
  4: "אפריל",
  5: "מאי",
  6: "יוני",
  7: "יולי",
  8: "אוגוסט",
  9: "ספטמבר",
  10: "אוקטובר",
  11: "נובמבר",
  12: "דצמבר",
};

const addSpending = functions.https.onCall(
  async (data, context) => {
    const {
      uid,
      category,
      subCategory,
      date,
      sum,
      note = "",
      isPayment = false,
      totalPayments,
      paymentNumber,
      originalSum,
      parentPaymentId,
    } = data;

    if (!uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "User ID is required"
      );
    }

    if (!category || !subCategory) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Category and subcategory are required"
      );
    }

    if (typeof sum !== "number" || sum <= 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Sum must be a positive number"
      );
    }

    try {
      const timestamp = Timestamp.fromDate(
        new Date(date)
      );
      const year = timestamp
        .toDate()
        .getFullYear();
      const month =
        timestamp.toDate().getMonth() + 1;

      const spendingData = {
        category,
        subCategory,
        date: timestamp,
        year,
        month,
        sum,
        note,
        uid,
      };

      // Add payment-specific fields if this is a payment
      if (isPayment) {
        Object.assign(spendingData, {
          isPayment,
          totalPayments,
          paymentNumber,
          originalSum,
        });

        if (parentPaymentId) {
          Object.assign(spendingData, {
            parentPaymentId,
          });
        }
      }

      const spendingRef = await db
        .collection("spendings")
        .add(spendingData);

      // Update dates collection
      const datesRef = db
        .collection("dates")
        .where("uid", "==", uid);

      const querySnapshot = await datesRef.get();

      if (querySnapshot.empty) {
        await db.collection("dates").add({
          uid,
          years: [
            {
              year,
              months: [
                {
                  month,
                  display: monthsList[month],
                },
              ],
            },
          ],
        });
      } else {
        for (const doc of querySnapshot.docs) {
          const years = doc.data().years;
          const yearExists = years.find(
            (y: any) => y.year === year
          );

          if (yearExists) {
            const monthExists =
              yearExists.months.find(
                (m: any) => m.month === month
              );

            if (!monthExists) {
              yearExists.months.push({
                month,
                display: monthsList[month],
              });
            }
          } else {
            years.push({
              year,
              months: [
                {
                  month,
                  display: monthsList[month],
                },
              ],
            });
          }

          await doc.ref.update({ years });
        }
      }

      return spendingRef.id;
    } catch (error) {
      console.error(
        "Error adding spending:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Error adding spending",
        error
      );
    }
  }
);

export default addSpending;
