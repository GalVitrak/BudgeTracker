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
    const uid = data.uid;
    const category = data.category;
    const subCategory = data.subCategory;
    const date: Timestamp = Timestamp.fromDate(
      new Date(data.date)
    );
    const year = date.toDate().getFullYear();
    const month = date.toDate().getMonth() + 1;

    const sum = data.sum;
    const note = data.note || "";

    const spendingRef = await db
      .collection("spendings")
      .add({
        category: category,
        subCategory: subCategory,
        date: date,
        year: year,
        month: month,
        sum: sum,
        note: note,
        uid: uid,
      });

    const datesRef = db
      .collection("dates")
      .where("uid", "==", uid);

    datesRef.get().then((querySnapshot) => {
      if (querySnapshot.empty) {
        db.collection("dates").add({
          uid: uid,
          years: [
            {
              year: year,
              months: [
                {
                  month: month,
                  display: monthsList[month],
                },
              ],
            },
          ],
        });
      } else {
        querySnapshot.docs.map((doc) => {
          const years = doc.data().years;

          const yearExists = years.find(
            (yearDoc: any) =>
              yearDoc.year === year
          );

          if (yearExists) {
            const monthExists =
              yearExists.months.find(
                (monthDoc: any) =>
                  monthDoc.month === month
              );

            if (monthExists) {
            } else {
              yearExists.months.push({
                month: month,
                display: monthsList[month],
              });
            }
          } else {
            years.push({
              year: year,
              months: [
                {
                  month: month,
                  display: monthsList[month],
                },
              ],
            });
          }
          db.collection("dates")
            .doc(doc.id)
            .update({
              uid: uid,
              years: years,
            });
        });
      }
    });

    return spendingRef.id;
  }
);

export default addSpending;
