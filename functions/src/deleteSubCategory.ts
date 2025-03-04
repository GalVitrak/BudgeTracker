import * as functions from "firebase-functions/v1";
import { db } from ".";

const deleteSubCategory = functions.https.onCall(
  async (data, context) => {
    const { categoryId, subCategoryName, uid } =
      data;

    if (!categoryId || !subCategoryName || !uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Category ID, subcategory name, and UID are required"
      );
    }

    try {
      const categoryRef = db
        .collection("categories")
        .doc(categoryId);
      const doc = await categoryRef.get();

      if (!doc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Category not found"
        );
      }

      const categoryData = doc.data();
      if (
        !categoryData ||
        !categoryData.subCategories
      ) {
        throw new functions.https.HttpsError(
          "not-found",
          "Category data not found"
        );
      }


      const subCategory =
        categoryData.subCategories.find(
          (sub: any) =>
            sub.name === subCategoryName
        );

      if (!subCategory) {
        throw new functions.https.HttpsError(
          "not-found",
          "Subcategory not found"
        );
      }



      // Check if subcategory is default
      if (subCategory.isDefault) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Cannot delete default subcategories"
        );
      }

      // If subcategory has other users, just remove the current user's UID
      if (
        subCategory.uid &&
        subCategory.uid.length > 1
      ) {
    
        const updatedSubCategories =
          categoryData.subCategories.map(
            (sub: any) => {
              if (sub.name === subCategoryName) {
                return {
                  ...sub,
                  uid: sub.uid.filter(
                    (id: string) => id !== uid
                  ),
                };
              }
              return sub;
            }
          );

        await categoryRef.update({
          subCategories: updatedSubCategories,
        });
        return { success: true };
      }

      // If this is the last user, remove the entire subcategory
      const updatedSubCategories =
        categoryData.subCategories.filter(
          (sub: any) =>
            sub.name !== subCategoryName
        );

      await categoryRef.update({
        subCategories: updatedSubCategories,
      });
      return { success: true };
    } catch (error) {
      console.error(
        "Error deleting subcategory:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Error deleting subcategory",
        error
      );
    }
  }
);

export default deleteSubCategory;
