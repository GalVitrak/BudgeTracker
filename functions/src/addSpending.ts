import * as functions from "firebase-functions/v1";
import { db } from ".";
import { Timestamp } from "firebase-admin/firestore";

const addSpending = functions.https.onCall(
  async (data, context) => {
    const uid = data.uid;
    const category = data.category;
    const subCategory = data.subCategory;
    const date: Timestamp = Timestamp.fromDate(
      new Date(data.date)
    );
    const sum = data.sum;
    const note = data.note;

    const spendingRef = await db
      .collection("spendings")
      .add({
        category: category,
        subCategory: subCategory,
        date: date,
        sum: sum,
        note: note,
        uid: uid,
      });

    return spendingRef.id;
  }
);

export default addSpending;
