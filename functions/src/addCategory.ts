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
      // Check if category with this name already exists
      const existingCategory = await db
        .collection("categories")
        .where("name", "==", name)
        .get();

      if (!existingCategory.empty) {
        // Category exists, add the user's UID if not already present
        const doc = existingCategory.docs[0];
        const category = doc.data();

        // Add user to category if not already present
        if (!category.uid.includes(uid)) {
          await doc.ref.update({
            uid: FieldValue.arrayUnion(uid),
          });
        }

        // Handle subcategories if provided
        if (
          subCategories &&
          subCategories.length > 0
        ) {
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

      // Create new category
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
