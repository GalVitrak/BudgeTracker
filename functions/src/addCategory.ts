import * as functions from "firebase-functions/v1";
import { db } from ".";
import { FieldValue } from "firebase-admin/firestore";

const addCategory = functions.https.onCall(
  async (data, context) => {
    const {
      name,
      uid,
      subCategories,
      isDefault,
    } = data;

    if (!name || !uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Name and UID are required"
      );
    }

    try {
      // Check if category with this name already exists for this specific user
      const existingUserCategory = await db
        .collection("categories")
        .where("name", "==", name)
        .where("uid", "array-contains", uid)
        .get();

      if (!existingUserCategory.empty) {
        // User already has a category with this name, just return the existing one
        const doc = existingUserCategory.docs[0];

        // Handle subcategories if provided
        if (
          subCategories &&
          subCategories.length > 0
        ) {
          const category = doc.data();
          const currentSubCategories =
            category.subCategories || [];

          // Add new subcategories or update existing ones
          for (const newSub of subCategories) {
            const existingSubIndex =
              currentSubCategories.findIndex(
                (sub: any) =>
                  sub.name === newSub.name
              );

            if (existingSubIndex >= 0) {
              const existingSub =
                currentSubCategories[
                  existingSubIndex
                ];
              if (
                !existingSub.uid.includes(uid)
              ) {
                existingSub.uid.push(uid);
              }
              currentSubCategories[
                existingSubIndex
              ] = existingSub;
            } else {
              currentSubCategories.push({
                name: newSub.name,
                uid: [uid],
                isDefault:
                  newSub.isDefault || false,
              });
            }
          }

          await doc.ref.update({
            subCategories: currentSubCategories,
          });
        }

        return doc.id;
      }

      // Create new category - each user gets their own category even if names are similar
      const newCategoryRef = await db
        .collection("categories")
        .add({
          name,
          uid: [uid],
          subCategories: subCategories || [],
          isDefault: isDefault || false,
        });

      return newCategoryRef.id;
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        "Error adding category",
        error
      );
    }
  }
);

export default addCategory;
