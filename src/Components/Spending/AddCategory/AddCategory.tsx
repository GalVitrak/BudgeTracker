import { useForm } from "react-hook-form";
import "../../../Styles/SharedModals.css";
import CategoryModel from "../../../Models/CategoryModel";
import { authStore } from "../../../Redux/AuthState";
import { useState } from "react";
import subCategoriesModel from "../../../Models/SubCategoryModel";
import notifyService from "../../../Services/NotifyService";
import spendingsService from "../../../Services/SpendingsService";

interface addCategoryProps {
  modalStateChanger: Function;
}

export function AddCategory(
  props: addCategoryProps
): JSX.Element {
  const { register, handleSubmit } =
    useForm<CategoryModel>();
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function send(category: CategoryModel) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const uid = authStore.getState().user?.uid;
      const subCategories: subCategoriesModel[] =
        [];

      if (!uid) {
        notifyService.error({
          message: "משתמש לא מחובר",
        });
        throw new Error("משתמש לא מחובר");
      }

      const newSubCategory =
        new subCategoriesModel(
          category.subCategories.toString(),
          uid
        );
      subCategories.push(newSubCategory);

      const newCategory = new CategoryModel(
        uid,
        category.name,
        subCategories
      );

      await spendingsService.addCategory(
        newCategory
      );
      props.modalStateChanger(false);
      notifyService.success(
        "הקטגוריה נוספה בהצלחה"
      );
    } catch (error) {
      console.error(
        "Error adding category:",
        error
      );
      notifyService.error({
        message: "שגיאה בהוספת הקטגוריה",
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
            // placeholder="שם הקטגוריה"
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
            // placeholder="שם תת-הקטגוריה"
            {...register("subCategories")}
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
