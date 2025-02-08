import { useForm } from "react-hook-form";
import "../../../Styles/SharedModals.css";
import SubCategoryModel from "../../../Models/SubCategoryModel";
import { authStore } from "../../../Redux/AuthState";
import {
  collection,
  query,
  where,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../../../firebase-config";
import CategoryModel from "../../../Models/CategoryModel";
import { useState, useEffect } from "react";
import spendingsService from "../../../Services/SpendingsService";
import notifyService from "../../../Services/NotifyService";

interface addSubCategoryProps {
  modalStateChanger: Function;
  preSelectedCategory?: CategoryModel;
}

export function AddSubCategory(
  props: addSubCategoryProps
): JSX.Element {
  const { register, handleSubmit } =
    useForm<SubCategoryModel>();
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel | undefined>(
      props.preSelectedCategory
    );

  const uid = authStore.getState().user?.uid;
  const categoriesRef = collection(
    db,
    "categories"
  );
  const q = query(
    categoriesRef,
    where("uid", "in", ["allUsers", uid])
  );
  const [snapshot, loading] = useCollection(q);

  const categories: CategoryModel[] =
    snapshot?.docs.map(
      (doc) =>
        new CategoryModel(
          doc.data().uid,
          doc.data().name,
          doc.data().subCategories,
          doc.id
        )
    ) || [];

  useEffect(() => {
    if (props.preSelectedCategory) {
      setSelectedCategory(
        props.preSelectedCategory
      );
    }
  }, [props.preSelectedCategory]);

  async function send(
    subCategory: SubCategoryModel
  ) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!selectedCategory) {
        notifyService.info("בחר קטגוריה");
        return;
      }

      if (!selectedCategory.id) {
        // If we have a preselected category but no ID, try to find it in the categories list
        const foundCategory = categories.find(
          (cat) =>
            cat.name === selectedCategory.name
        );
        if (!foundCategory) {
          notifyService.error({
            message: "לא נמצאה קטגוריה תקינה",
          });
          return;
        }
        selectedCategory.id = foundCategory.id;
      }

      if (!uid) {
        notifyService.error({
          message: "משתמש לא מחובר",
        });
        return;
      }

      const newSubCategory = new SubCategoryModel(
        subCategory.name,
        uid
      );

      // Create a new copy of the category to avoid mutating the state directly
      const categoryToUpdate = {
        ...selectedCategory,
      };
      if (!categoryToUpdate.subCategories) {
        categoryToUpdate.subCategories = [];
      }
      categoryToUpdate.subCategories.push(
        newSubCategory
      );

      await spendingsService.addSubCategory(
        categoryToUpdate
      );
      props.modalStateChanger(false);
    } catch (error) {
      console.error(
        "Error adding sub-category:",
        error
      );
      notifyService.error({
        message: "שגיאה בהוספת תת-הקטגוריה",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="AddSubCategory">
      <form
        onSubmit={handleSubmit(send)}
        className="modal-form"
      >
        <div className="input-group">
          <select
            value={
              selectedCategory?.name || "value"
            }
            className="input"
            name="category"
            required
            onChange={(e) => {
              const category = categories.find(
                (category) =>
                  category.name === e.target.value
              );
              setSelectedCategory(category);
            }}
          >
            <option value="value" disabled>
              בחר קטגוריה
            </option>
            {loading ? (
              <option value="" disabled>
                טוען...
              </option>
            ) : (
              categories.map((category) => (
                <option
                  key={category.id}
                  value={category.name}
                >
                  {category.name}
                </option>
              ))
            )}
          </select>
          <label
            className="label"
            htmlFor="category"
          >
            קטגוריה
          </label>
        </div>

        <div className="input-group">
          <input
            className="input"
            required
            type="text"
            {...register("name")}
          />
          <label className="label">
            שם תת-הקטגוריה
          </label>
        </div>

        <div className="input-group">
          <button
            className="modern-button"
            disabled={
              isSubmitting || !selectedCategory
            }
          >
            {isSubmitting ? "מוסיף..." : "הוסף"}
          </button>
        </div>
      </form>
    </div>
  );
}
