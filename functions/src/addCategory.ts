import * as functions from "firebase-functions/v1";
import { db } from ".";

const addCategory = functions.https.onCall(
  async (data, context) => {
    const uid = data.uid;
    const name = data.name;
    const subCategories = data.subCategories;

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
