import { useForm } from "react-hook-form";
import "../../../Styles/SharedModals.css";
import CategoryModel from "../../../Models/CategoryModel";
import { authStore } from "../../../Redux/AuthState";
import { useState } from "react";
import subCategoriesModel from "../../../Models/SubCategoryModel";
import notifyService from "../../../Services/NotifyService";
import categoryService from "../../../Services/CategoryService";

interface addCategoryProps {
  modalStateChanger: Function;
}

interface CategoryFormData {
  name: string;
  subCategory: string;
}

export function AddCategory(
  props: addCategoryProps
): JSX.Element {
  const { register, handleSubmit } =
    useForm<CategoryFormData>();
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function send(
    formData: CategoryFormData
  ) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const uid = authStore.getState().user?.uid;

      if (!uid) {
        console.error("No user UID found");
        notifyService.error({
          message: "משתמש לא מחובר",
        });
        throw new Error("משתמש לא מחובר");
      }

      // Create a new subcategory with the proper model

      const newSubCategory =
        new subCategoriesModel(
          formData.subCategory,
          [uid],
          false
        );

      // Create the category with the subcategory

      const newCategory = new CategoryModel(
        [uid],
        formData.name,
        [newSubCategory],
        undefined,
        false
      );

        await categoryService.addCategory(
          newCategory
        );

      props.modalStateChanger(false);
    } catch (error) {
      console.error(
        "Detailed error in category creation:",
        error
      );
      notifyService.error({
        message: "שגיאה בהוספת הקטגוריה",
        details: error,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="AddCategory">
      <form
        onSubmit={handleSubmit(send)}
        className="modal-form"
      >
        <div className="input-group">
          <input
            className="input"
            required
            type="text"
            {...register("name")}
          />
          <label className="label">
            שם הקטגוריה
          </label>
        </div>
        <div className="input-group">
          <input
            className="input"
            required
            type="text"
            {...register("subCategory")}
          />
          <label className="label">
            תת-קטגוריה
          </label>
        </div>
        <div className="input-group">
          <button
            className="modern-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "מוסיף..." : "הוסף"}
          </button>
        </div>
      </form>
    </div>
  );
}
