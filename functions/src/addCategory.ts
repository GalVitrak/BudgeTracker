import * as functions from "firebase-functions/v1";
import { db } from ".";
import { FieldValue } from "firebase-admin/firestore";

const addCategory = functions.https.onCall(
  async (data, context) => {
    console.log("Received category data:", data);
    const {
      name,
      uid,
      subCategories,
      isDefault,
    } = data;

    if (!name || !uid) {
      console.error("Missing required fields:", {
        name,
        uid,
      });
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Name and UID are required"
      );
    }

    try {
      // Check if category with this name already exists
      console.log(
        "Checking for existing category with name:",
        name
      );
      const existingCategory = await db
        .collection("categories")
        .where("name", "==", name)
        .get();

      if (!existingCategory.empty) {
        console.log(
          "Found existing category, updating..."
        );
        // Category exists, add the user's UID if not already present
        const doc = existingCategory.docs[0];
        const category = doc.data();
        console.log(
          "Existing category data:",
          category
        );

        // Add user to category if not already present
        if (!category.uid.includes(uid)) {
          console.log(
            "Adding user to existing category:",
            uid
          );
          await doc.ref.update({
            uid: FieldValue.arrayUnion(uid),
          });
        }

        // Handle subcategories if provided
        if (
          subCategories &&
          subCategories.length > 0
        ) {
          console.log(
            "Processing subcategories:",
            subCategories
          );
          const currentSubCategories =
            category.subCategories || [];

          // Add new subcategories or update existing ones
          for (const newSub of subCategories) {
            console.log(
              "Processing subcategory:",
              newSub
            );
            const existingSubIndex =
              currentSubCategories.findIndex(
                (sub: any) =>
                  sub.name === newSub.name
              );

            if (existingSubIndex >= 0) {
              console.log(
                "Found existing subcategory, updating UIDs"
              );
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
              console.log(
                "Adding new subcategory"
              );
              currentSubCategories.push({
                name: newSub.name,
                uid: [uid],
                isDefault:
                  newSub.isDefault || false,
              });
            }
          }

          console.log(
            "Updating category with new subcategories:",
            currentSubCategories
          );
          await doc.ref.update({
            subCategories: currentSubCategories,
          });
        }

        return doc.id;
      }

      // Create new category
      console.log(
        "Creating new category with data:",
        {
          name,
          uid: [uid],
          subCategories,
          isDefault: isDefault || false,
        }
      );

      const newCategoryRef = await db
        .collection("categories")
        .add({
          name,
          uid: [uid],
          subCategories: subCategories || [],
          isDefault: isDefault || false,
        });

      console.log(
        "Created new category with ID:",
        newCategoryRef.id
      );
      return newCategoryRef.id;
    } catch (error) {
      console.error(
        "Error in addCategory:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Error adding category",
        error
      );
    }
  }
);

export default addCategory;
