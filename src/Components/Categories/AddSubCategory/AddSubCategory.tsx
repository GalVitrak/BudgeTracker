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
import {
  useState,
  useEffect,
  useMemo,
} from "react";
import categoryService from "../../../Services/CategoryService";
import notifyService from "../../../Services/NotifyService";

interface addSubCategoryProps {
  modalStateChanger: Function;
  preSelectedCategory?: CategoryModel;
  setSelectedCategory: Function;
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
      undefined
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

  // Memoize the categories array to prevent infinite re-renders
  const categories: CategoryModel[] =
    useMemo(() => {
      return (
        snapshot?.docs.map(
          (doc) =>
            new CategoryModel(
              doc.data().uid,
              doc.data().name,
              doc.data().subCategories,
              doc.id
            )
        ) || []
      );
    }, [snapshot]);

  // Fix the useEffect to properly set the preselected category
  useEffect(() => {
    if (
      props.preSelectedCategory &&
      categories.length > 0 &&
      !loading
    ) {
      // Find the category in the loaded categories array that matches the preselected one
      const matchingCategory = categories.find(
        (cat) =>
          cat.id ===
            props.preSelectedCategory?.id ||
          cat.name ===
            props.preSelectedCategory?.name
      );

      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
      }
    }
  }, [
    props.preSelectedCategory?.id, // Use specific properties instead of the whole object
    props.preSelectedCategory?.name,
    categories.length, // Use length instead of the whole array
    loading,
  ]);

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

      selectedCategory.subCategories.push(
        subCategory
      );

      props.setSelectedCategory(selectedCategory);

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
              selectedCategory?.name || "default"
            } // Changed from "value" to "default"
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
            <option value="default" disabled>
              {" "}
              {/* Changed from "value" to "default" */}
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
