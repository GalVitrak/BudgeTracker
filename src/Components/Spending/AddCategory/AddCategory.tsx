import { useForm } from "react-hook-form";
import CategoryModel from "../../../Models/CategoryModel";
import { authStore } from "../../../Redux/AuthState";

import "./AddCategory.css";
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

  async function send(category: CategoryModel) {
    const uid = authStore.getState().user?.uid;
    const subCategories: subCategoriesModel[] =
      [];
    let newCategory: CategoryModel;
    if (uid) {
      const newSubCategory =
        new subCategoriesModel(
          category.subCategories.toString(),
          uid
        );
      subCategories.push(newSubCategory);

      newCategory = new CategoryModel(
        uid,
        category.name,
        subCategories
      );
    } else {
      notifyService.error("משתמש לא מחובר");
      throw new Error("משתמש לא מחובר");
    }

    await spendingsService.addCategory(
      newCategory
    );
    props.modalStateChanger(false);
  }

  return (
    <div className="AddCategory">
      <form onSubmit={handleSubmit(send)}>
        <div className="input-group">
          <input
            className="input"
            autoFocus
            required
            type="text"
            {...register("name", {
              required: true,
            })}
          />
          <label className="label" htmlFor="name">
            שם קטגוריה
          </label>
        </div>
        <div className="input-group">
          <input
            className="input"
            autoFocus
            required
            type="text"
            {...register("subCategories", {
              required: true,
            })}
          />
          <label
            className="label"
            htmlFor="subCategories"
          >
            תת קטגוריה
          </label>
        </div>
        <div className="input-group">
          <button className="input">הוסף</button>
        </div>{" "}
      </form>
    </div>
  );
}
