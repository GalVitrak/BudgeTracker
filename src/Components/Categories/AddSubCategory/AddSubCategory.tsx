import { useForm } from "react-hook-form";
import "../../../Styles/SharedModals.css";
import SubCategoryModel from "../../../Models/SubCategoryModel";
import { authStore } from "../../../Redux/AuthState";
import {
  collection,
  or,
  query,
  where,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../../../firebase-config";
import CategoryModel from "../../../Models/CategoryModel";
import { useState, useEffect } from "react";
import categoryService from "../../../Services/CategoryService";
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
    or(
      where("uid", "array-contains", uid),
      where("uid", "array-contains", "allUsers")
    )
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
      const uid = authStore.getState().user?.uid;

      if (!uid) {
        notifyService.error({
          message: "משתמש לא מחובר",
        });
        return;
      }

      if (!selectedCategory?.id) {
        notifyService.error({
          message: "יש לבחור קטגוריה",
        });
        return;
      }

      await categoryService.addSubCategory(
        selectedCategory.id,
        subCategory.name,
        uid
      );

      props.modalStateChanger(false);
   
    } catch (error) {
      console.error(
        "Error adding subcategory:",
        error
      );
      notifyService.error({
        message: "שגיאה בהוספת תת-הקטגוריה",
        details: error,
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
