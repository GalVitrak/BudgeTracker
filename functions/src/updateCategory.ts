import * as functions from "firebase-functions/v1";
import { db } from ".";
import { FieldValue } from "firebase-admin/firestore";

const updateCategory = functions.https.onCall(
  async (data, context) => {
    const { categoryId, name, uid } = data;

    if (!categoryId || !name || !uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Category ID, name and UID are required"
      );
    }

    try {
      // Check if a category with the new name already exists
      const existingCategory = await db
        .collection("categories")
        .where("name", "==", name)
        .get();

      const categoryRef = db
        .collection("categories")
        .doc(categoryId);
      const categoryDoc = await categoryRef.get();

      if (!categoryDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Category not found"
        );
      }

      const categoryData = categoryDoc.data();
      if (!categoryData) {
        throw new functions.https.HttpsError(
          "not-found",
          "Category data not found"
        );
      }

      // If category with new name exists
      if (!existingCategory.empty) {
        const existingDoc =
          existingCategory.docs[0];
        const existingData = existingDoc.data();

        // Remove user's UID from old category
        await categoryRef.update({
          uid: FieldValue.arrayRemove(uid),
        });

        // Add user's UID to existing category if not already present
        if (!existingData.uid.includes(uid)) {
          await existingDoc.ref.update({
            uid: FieldValue.arrayUnion(uid),
          });
        }

        // If old category has no more users, delete it
        if (categoryData.uid.length <= 1) {
          await categoryRef.delete();
        }

        return {
          success: true,
          categoryId: existingDoc.id,
        };
      }

      // If no category with new name exists, just update the name
      await categoryRef.update({ name });
      return { success: true, categoryId };
    } catch (error) {
      console.error(
        "Error updating category:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Error updating category",
        error
      );
    }
  }
);

export default updateCategory;
