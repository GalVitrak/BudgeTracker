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
  const { register, handleSubmit, watch } =
    useForm<CategoryFormData>();
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // Watch form values for logging
  const formValues = watch();
  console.log("Current form values:", formValues);

  async function send(
    formData: CategoryFormData
  ) {
    console.log(
      "Starting category creation with data:",
      formData
    );
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const uid = authStore.getState().user?.uid;
      console.log("Current user UID:", uid);

      if (!uid) {
        console.error("No user UID found");
        notifyService.error({
          message: "משתמש לא מחובר",
        });
        throw new Error("משתמש לא מחובר");
      }

      // Create a new subcategory with the proper model
      console.log(
        "Creating subcategory with name:",
        formData.subCategory
      );
      const newSubCategory =
        new subCategoriesModel(
          formData.subCategory,
          [uid],
          false
        );
      console.log(
        "Created subcategory model:",
        newSubCategory
      );

      // Create the category with the subcategory
      console.log(
        "Creating category with name:",
        formData.name
      );
      const newCategory = new CategoryModel(
        [uid],
        formData.name,
        [newSubCategory],
        undefined,
        false
      );
      console.log(
        "Created category model:",
        newCategory
      );

      console.log(
        "Sending category to service..."
      );
      const result =
        await categoryService.addCategory(
          newCategory
        );
      console.log(
        "Category creation result:",
        result
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
            {...register("name", {
              onChange: (e) =>
                console.log(
                  "Category name changed:",
                  e.target.value
                ),
            })}
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
            {...register("subCategory", {
              onChange: (e) =>
                console.log(
                  "Subcategory name changed:",
                  e.target.value
                ),
            })}
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
