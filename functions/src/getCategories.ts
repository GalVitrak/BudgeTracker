import * as functions from "firebase-functions/v1";
import { db } from ".";

const getCategories = functions.https.onCall(
  async (data, context) => {
    const uid = data.uid;

    const snapshot = await db
      .collection("categories")
      .where("uid", "==", `allUsers`)
      .where("uid", "==", uid)
      .get();

    return snapshot.docs.map((doc) => {
      doc.data();
    });
  }
);

export default getCategories;
