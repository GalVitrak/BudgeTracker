import * as functions from "firebase-functions/v1";
import { db } from ".";

const deleteSpending = functions.https.onCall(
  async (data, context) => {
    const spendingId = data.spendingId;
    console.log(spendingId);
    
    const spendingRef = db
      .collection("spendings")
      .doc(spendingId);
    console.log(spendingRef);
    const spendingDoc = await spendingRef.get();
    if (!spendingDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Spending not found"
      );
    }
    const spendingData = spendingDoc.data();
    if (!spendingData) {
      throw new functions.https.HttpsError(
        "not-found",
        "Spending not found"
      );
    }
    const uid = spendingData.uid;
    const year = spendingData.year;
    const month = spendingData.month;

    const spendingMonthCount = await db
      .collection("spendings")
      .where("uid", "==", uid)
      .where("year", "==", year)
      .where("month", "==", month)
      .count()
      .get();

    if (spendingMonthCount.data().count === 1) {
      const spendingYearCount = await db
        .collection("spendings")
        .where("uid", "==", uid)
        .where("year", "==", year)
        .count()
        .get();
      if (spendingYearCount.data().count === 1) {
        const datesRef = db
          .collection("dates")
          .where("uid", "==", uid);
        const datesSnapshot =
          await datesRef.get();
        datesSnapshot.forEach(async (doc) => {
          const datesData = doc.data();
          const updatedYears =
            datesData.years.filter(
              (y: any) => y.year !== year
            );
          await doc.ref.update({
            years: updatedYears,
          });
        });
      } else {
        const datesRef = db
          .collection("dates")
          .where("uid", "==", uid);
        const datesSnapshot =
          await datesRef.get();
        datesSnapshot.forEach(async (doc) => {
          const datesData = doc.data();
          const updatedYears =
            datesData.years.map((y: any) => {
              if (y.year === year) {
                return {
                  ...y,
                  months: y.months.filter(
                    (m: any) => m.month !== month
                  ),
                };
              }
              return y;
            });
          await doc.ref.update({
            years: updatedYears,
          });
        });
      }
    }

    await spendingRef.delete();
  }
);

export default deleteSpending;
