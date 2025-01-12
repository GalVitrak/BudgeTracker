import { useForm } from "react-hook-form";
import "./AddSpending.css";
import SpendingModel from "../../../Models/SpendingModel";
import CategoryModel from "../../../Models/CategoryModel";
import { useEffect, useState } from "react";
import spendingsService from "../../../Services/SpendingsService";
import { LoadingOutlined } from "@ant-design/icons";
import {
  collection,
  query,
  where,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../../../../firebase-config";
import { authStore } from "../../../Redux/AuthState";

interface addSpendingProps {
  ModalStatus: boolean;
}

export function AddSpending(
  props: addSpendingProps
): JSX.Element {
  const { register, handleSubmit } =
    useForm<SpendingModel>();

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

  const [selectedDate, setSelectedDate] =
    useState<string>(
      new Date().toISOString().split("T")[0]
    );

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel>();

  useEffect(() => {}, [selectedCategory]);

  async function send(spending: SpendingModel) {
    const spendingID =
      await spendingsService.addSpending(
        spending
      );
    console.log(spendingID);
  }

  return (
    <div className="AddSpending">
      <form onSubmit={handleSubmit(send)}>
        <div className="input-group">
          <select
            className="input"
            {...register("category", {
              onChange: (e) => {
                setSelectedCategory(
                  categories?.find(
                    (category) =>
                      category.name ===
                      e.target.value
                  )
                );
              },
            })}
          >
            {loading && (
              <option key={"loading"}>
                <LoadingOutlined />
              </option>
            )}
            <option key={"select"} value="">
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
          <select
            className="input"
            {...register("subCategory")}
          >
            <option value="">
              בחר תת-קטגוריה
            </option>
            <>
              {selectedCategory?.subCategories?.map(
                (subCategory) => {
                  return (
                    <option
                      value={subCategory.name}
                      key={subCategory.name}
                    >
                      {subCategory.name}
                    </option>
                  );
                }
              )}
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
            value={selectedDate}
            className="input"
            autoFocus
            required
            type="date"
            {...register("date", {
              onChange: (e) => {
                setSelectedDate(e.target.value);
              },
            })}
          />
          <label className="label" htmlFor="date">
            בחר תאריך
          </label>
        </div>
        <div className="input-group">
          <input
            className="input"
            required
            type="number"
            {...register("sum")}
          />
          <label className="label" htmlFor="sum">
            סכום
          </label>
        </div>
        <div className="input-group">
          <input
            className="input"
            type="text"
            {...register("note")}
          />
          <label className="label" htmlFor="note">
            הערה
          </label>
        </div>
        <div className="input-group">
          <button className="input">הוסף</button>
        </div>{" "}
      </form>
    </div>
  );
}
