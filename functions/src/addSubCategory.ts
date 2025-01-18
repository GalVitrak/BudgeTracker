import * as functions from "firebase-functions/v1";
import { db } from ".";

const addSubCategory = functions.https.onCall(
  async (data, context) => {
    const name = data.name;
    const subCategories = data.subCategories;
    console.log(
      "🚀 ~ subCategories:",
      subCategories
    );
    console.log("🚀 ~ name:", name);

    await db
      .collection("categories")
      .where("name", "==", name)
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
