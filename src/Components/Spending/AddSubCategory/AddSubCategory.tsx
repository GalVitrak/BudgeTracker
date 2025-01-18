import { useForm } from "react-hook-form";
import "./AddSubCategory.css";
import SubCategoryModel from "../../../Models/SubCategoryModel";
import { authStore } from "../../../Redux/AuthState";
import {
  collection,
  query,
  where,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../../../../firebase-config";
import CategoryModel from "../../../Models/CategoryModel";
import { useState, useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import spendingsService from "../../../Services/SpendingsService";
import notifyService from "../../../Services/NotifyService";

interface addSubCategoryProps {
  modalStateChanger: Function;
}

export function AddSubCategory(
  props: addSubCategoryProps
): JSX.Element {
  const uid = authStore.getState().user?.uid;
  const categoriesRef = collection(
    db,
    "categories"
  );
  const q = query(
    categoriesRef,
    where("uid", "in", ["allUsers", uid])
  );
  const [categoriesData, loading] =
    useCollectionData(q);

  const categories =
    categoriesData as CategoryModel[];

  const { register, handleSubmit } =
    useForm<SubCategoryModel>();

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel>();

  useEffect(() => {}, [selectedCategory]);

  async function send(
    subCategory: SubCategoryModel
  ) {
    if (!selectedCategory) {
      notifyService.info("בחר קטגוריה");
      return;
    }
    console.log(categories);
    console.log(selectedCategory);
    console.log(subCategory);
    if (uid) {
      const newSubCategory = new SubCategoryModel(
        subCategory.name,
        uid
      );
      console.log(newSubCategory);
      selectedCategory?.subCategories.push(
        newSubCategory
      );

      if (selectedCategory) {
        await spendingsService.addSubCategory(
          selectedCategory
        );
      }
      props.modalStateChanger(false);
    }
  }

  return (
    <div className="AddSubCategory">
      <form onSubmit={handleSubmit(send)}>
        <div className="input-group">
          <select
            className="input"
            onChange={(e) => {
              const category = categories.find(
                (category) =>
                  category.name === e.target.value
              );
              setSelectedCategory(category);
            }}
          >
            {loading && (
              <option key={"loading"}>
                <LoadingOutlined />
              </option>
            )}
            <option
              key={"select"}
              value=""
              disabled
              selected
            >
              בחר קטגוריה
            </option>
            <>
              {categories?.map((category) => {
                return (
                  <option
                    value={category.name}
                    key={category.id}
                  >
                    {category.name}
                  </option>
                );
              })}
            </>
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
            autoFocus
            required
            type="text"
            {...register("name", {
              required: true,
            })}
          />
          <label className="label" htmlFor="name">
            שם תת קטגוריה
          </label>
        </div>
        <div className="input-group">
          <button className="input">הוסף</button>
        </div>
      </form>
    </div>
  );
}
