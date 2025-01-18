import * as functions from "firebase-functions/v1";
import { db } from ".";

const addCategory = functions.https.onCall(
  async (data, context) => {
    const uid = data.uid;
    const name = data.name;
    const subCategories = data.subCategories;

    const existsRef = await db
      .collection("categories")
      .where("name", "==", name)
      .get();
    if (existsRef.docs.length > 0) {
      throw new functions.https.HttpsError(
        "already-exists",
        "קטגוריה כבר קיימת"
      );
    }

    const categoryRef = await db
      .collection("categories")
      .add({
        name: name,
        subCategories: subCategories,
        uid: uid,
      });

    return categoryRef.id;
  }
);

export default addCategory;
