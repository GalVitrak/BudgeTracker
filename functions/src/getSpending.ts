import * as functions from "firebase-functions/v1";
import { db } from ".";

const getSpendings = functions.https.onCall(
  async (data, context) => {
    const uid = data.uid;

    const snapshot = await db
      .collection("spendings")
      .where("uid", "==", uid)
      .orderBy("date", "asc")
      .get();

    const spendings: any[] = [];
    snapshot.docs.forEach((doc: any) => {
      const spending = {
        ...doc.data(),
        id: doc.id,
      };
      spendings.push(spending);
    });

    return spendings;
  }
);

export default getSpendings;
