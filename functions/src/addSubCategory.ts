import * as functions from "firebase-functions/v1";
import { db } from ".";

const addSubCategory = functions.https.onCall(
  async (data, context) => {
    const { categoryId, newSubCategory } = data;
    const { name, uid, isDefault } =
      newSubCategory;

    // Ensure uid is a string, not an array when passed in
    const userUid = Array.isArray(uid)
      ? uid[0]
      : uid;

    if (!categoryId || !name || !userUid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Category ID, subcategory name, and UID are required"
      );
    }

    try {
      const categoryRef = db
        .collection("categories")
        .doc(categoryId);

      // Get the current document
      const doc = await categoryRef.get();
      if (!doc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Category not found"
        );
      }

      const category = doc.data();
      if (!category) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Invalid category data"
        );
      }

      // Get current subcategories or initialize empty array
      const currentSubCategories =
        category.subCategories || [];

      // Find existing subcategory
      const existingIndex =
        currentSubCategories.findIndex(
          (sub: { name: string }) =>
            sub.name === name
        );

      let updatedSubCategories;
      if (existingIndex !== -1) {
        // Update existing subcategory
        const existingSub =
          currentSubCategories[existingIndex];

        if (!existingSub.uid.includes(userUid)) {
          // Create new array with updated subcategory
          updatedSubCategories = [
            ...currentSubCategories,
          ];
          updatedSubCategories[existingIndex] = {
            name: existingSub.name,
            uid: [...existingSub.uid, userUid],
            isDefault: existingSub.isDefault,
          };
        } else {
          return { success: true };
        }
      } else {
        // Add new subcategory
        const newSub = {
          name,
          uid: [userUid], // Single array with the user's UID
          isDefault: isDefault || false,
        };

        updatedSubCategories = [
          ...currentSubCategories,
          newSub,
        ];
      }

      // Update document with new subcategories array
      await categoryRef.set(
        { subCategories: updatedSubCategories },
        { merge: true }
      );

      return { success: true };
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        "Error adding subcategory",
        error
      );
    }
  }
);

export default addSubCategory;
