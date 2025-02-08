import * as functions from "firebase-functions/v1";
import { db } from ".";
import { FieldValue } from "firebase-admin/firestore";

const addSubCategory = functions.https.onCall(
  async (data, context) => {
    const { categoryId, newSubCategory } = data;

    if (!categoryId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Category ID is required"
      );
    }

    if (!newSubCategory || !newSubCategory.name) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "New subcategory with name is required"
      );
    }

    try {
      const docRef = db
        .collection("categories")
        .doc(categoryId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Category not found"
        );
      }

      await docRef.update({
        subCategories: FieldValue.arrayUnion(
          newSubCategory
        ),
      });
    } catch (error) {
      console.error(
        "Error in addSubCategory:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Error adding subcategory",
        error
      );
    }
  }
);

export default addSubCategory;
