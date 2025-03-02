import * as functions from "firebase-functions/v1";
import { db } from ".";
import { FieldValue } from "firebase-admin/firestore";

const deleteCategory = functions.https.onCall(
  async (data, context) => {
    const { categoryId, uid } = data;

    if (!categoryId || !uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Category ID and UID are required"
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
      if (!categoryData) {
        throw new functions.https.HttpsError(
          "not-found",
          "Category data not found"
        );
      }

      // Check if category is default
      if (categoryData.isDefault) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Cannot delete default categories"
        );
      }

      // If category has other users, just remove the current user's UID
      if (categoryData.uid.length > 1) {
        await categoryRef.update({
          uid: FieldValue.arrayRemove(uid),
        });
        return { success: true };
      }

      // If this is the last user, delete the entire category
      await categoryRef.delete();
      return { success: true };
    } catch (error) {
      console.error(
        "Error deleting category:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Error deleting category",
        error
      );
    }
  }
);

export default deleteCategory;
