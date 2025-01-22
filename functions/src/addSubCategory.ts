import * as functions from "firebase-functions/v1";
import { db } from ".";

const addSubCategory = functions.https.onCall(
  async (data, context) => {
    const subCategories = data.subCategories;
    const id = data.id;

    await db
      .collection("categories")
      .where("id", "==", id)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            subCategories: subCategories,
          });
        });
      })
      .catch((error) => {
        throw new functions.https.HttpsError(
          "unknown",
          error
        );
      });
  }
);

export default addSubCategory;
