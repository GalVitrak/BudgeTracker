import * as functions from "firebase-functions/v1";
import { db } from ".";

const addSubCategory = functions.https.onCall(
  async (data, context) => {
    console.log("Function called with data:", {
      categoryId: data.categoryId,
      newSubCategory: data.newSubCategory,
    });

    const { categoryId, newSubCategory } = data;
    const { name, uid, isDefault } =
      newSubCategory;

    // Ensure uid is a string, not an array when passed in
    const userUid = Array.isArray(uid)
      ? uid[0]
      : uid;

    if (!categoryId || !name || !userUid) {
      console.log("Missing required fields:", {
        categoryId,
        name,
        userUid,
      });
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
        console.log(
          "Category not found:",
          categoryId
        );
        throw new functions.https.HttpsError(
          "not-found",
          "Category not found"
        );
      }

      const category = doc.data();
      if (!category) {
        console.log(
          "Invalid category data for:",
          categoryId
        );
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Invalid category data"
        );
      }

      console.log(
        "Current category data:",
        category
      );

      // Get current subcategories or initialize empty array
      const currentSubCategories =
        category.subCategories || [];
      console.log(
        "Current subcategories:",
        currentSubCategories
      );

      // Find existing subcategory
      const existingIndex =
        currentSubCategories.findIndex(
          (sub: { name: string }) =>
            sub.name === name
        );
      console.log(
        "Existing subcategory index:",
        existingIndex
      );

      let updatedSubCategories;
      if (existingIndex !== -1) {
        // Update existing subcategory
        const existingSub =
          currentSubCategories[existingIndex];
        console.log(
          "Found existing subcategory:",
          existingSub
        );

        if (!existingSub.uid.includes(userUid)) {
          console.log(
            "Adding UID to existing subcategory:",
            userUid
          );
          // Create new array with updated subcategory
          updatedSubCategories = [
            ...currentSubCategories,
          ];
          updatedSubCategories[existingIndex] = {
            name: existingSub.name,
            uid: [...existingSub.uid, userUid],
            isDefault: existingSub.isDefault,
          };
          console.log(
            "Updated subcategory:",
            updatedSubCategories[existingIndex]
          );
        } else {
          console.log(
            "UID already exists in subcategory, no update needed"
          );
          return { success: true };
        }
      } else {
        // Add new subcategory
        const newSub = {
          name,
          uid: [userUid], // Single array with the user's UID
          isDefault: isDefault || false,
        };
        console.log(
          "Creating new subcategory:",
          newSub
        );

        updatedSubCategories = [
          ...currentSubCategories,
          newSub,
        ];
      }

      console.log(
        "Final subcategories array:",
        updatedSubCategories
      );

      // Update document with new subcategories array
      console.log("Updating document with:", {
        subCategories: updatedSubCategories,
      });

      await categoryRef.set(
        { subCategories: updatedSubCategories },
        { merge: true }
      );

      console.log("Update successful");
      return { success: true };
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
