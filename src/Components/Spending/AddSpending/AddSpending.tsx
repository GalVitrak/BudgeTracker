import "./AddSpending.css";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authStore } from "../../../Redux/AuthState";
import {
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import SpendingModel from "../../../Models/SpendingModel";
import notifyService from "../../../Services/NotifyService";
import { Modal } from "antd";
import { useCollectionData } from "react-firebase-hooks/firestore";
import CategoryModel from "../../../Models/CategoryModel";
import spendingsService from "../../../Services/SpendingsService";
import { AddCategory } from "../AddCategory/AddCategory";
import { AddSubCategory } from "../AddSubCategory/AddSubCategory";

interface addSpendingProps {
  modalStateChanger: Function;
  spendingStateChanger: Function;
}

export function AddSpending(
  props: addSpendingProps
): JSX.Element {
  const { register, handleSubmit } =
    useForm<SpendingModel>();
  const [
    isNewCategoryModalOpen,
    setIsNewCategoryModalOpen,
  ] = useState(false);
  const [
    isNewSubCategoryModalOpen,
    setIsNewSubCategoryModalOpen,
  ] = useState(false);
  const [selectedDate, setSelectedDate] =
    useState<string>(
      new Date().toISOString().split("T")[0]
    );
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel>();
  const [
    selectedSubCategory,
    setSelectedSubCategory,
  ] = useState<string>("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

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

  useEffect(() => {}, [selectedCategory]);

  async function send(spending: SpendingModel) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (
        !selectedCategory ||
        selectedCategory.name !==
          spending.category
      ) {
        notifyService.info("בחר קטגוריה תקינה");
        return;
      }

      if (
        selectedSubCategory === "default" ||
        !spending.subCategory
      ) {
        notifyService.info("בחר תת-קטגוריה");
        return;
      }

      const year = selectedDate.split("-")[0];
      const month = selectedDate.split("-")[1];
      spending.year = +year;
      spending.month = +month;

      // Ensure the category and subcategory match the selected values
      spending.category = selectedCategory.name;
      spending.subCategory = selectedSubCategory;

      await spendingsService
        .addSpending(spending)
        .then((id) => {
          if (id === "empty :(") {
            return;
          } else {
            spending.id = id;
            const date = new Intl.DateTimeFormat(
              "he-IL",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            ).format(new Date(selectedDate));
            spending.date = date;

            props.spendingStateChanger(spending);
            props.modalStateChanger(false);
          }
        });
    } catch (error) {
      console.error(
        "Error adding spending:",
        error
      );
      notifyService.error({
        message: "שגיאה בהוספת ההוצאה",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="AddSpending">
      <form
        onSubmit={handleSubmit(send)}
        className="modal-form"
      >
        <div className="input-group">
          <select
            value={
              selectedCategory?.name || "default"
            }
            className="input"
            {...register("category", {
              onChange: (e) => {
                if (e.target.value === "new") {
                  setIsNewCategoryModalOpen(true);
                  e.target.value = "default";
                  return;
                }
                const category = categories?.find(
                  (category) =>
                    category.name ===
                    e.target.value
                );
                setSelectedCategory(category);
                setSelectedSubCategory("default");
              },
            })}
          >
            <option value="default" disabled>
              בחר קטגוריה
            </option>
            {loading ? (
              <option value="" disabled>
                טוען...
              </option>
            ) : (
              <>
                {categories?.map((category) => (
                  <option
                    key={
                      category.id || category.name
                    }
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
                <option
                  value="new"
                  style={{
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  + הוסף קטגוריה חדשה
                </option>
              </>
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
          <select
            value={
              selectedSubCategory || "default"
            }
            className="input"
            {...register("subCategory", {
              onChange: (e) => {
                if (e.target.value === "new") {
                  setIsNewSubCategoryModalOpen(
                    true
                  );
                  setSelectedSubCategory(
                    "default"
                  );
                  return;
                }
                setSelectedSubCategory(
                  e.target.value
                );
              },
            })}
          >
            <option value="default" disabled>
              בחר תת-קטגוריה
            </option>
            {selectedCategory?.subCategories?.map(
              (subCategory) => (
                <option
                  key={`${selectedCategory.id}-${subCategory.name}`}
                  value={subCategory.name}
                >
                  {subCategory.name}
                </option>
              )
            )}
            {selectedCategory && (
              <option
                value="new"
                style={{
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                + הוסף תת-קטגוריה חדשה
              </option>
            )}
          </select>
          <label
            className="label"
            htmlFor="subCategory"
          >
            תת-קטגוריה
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
            step={0.01}
            min={1}
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
            הערה (לא חובה)
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

      <Modal
        destroyOnClose
        footer={null}
        centered
        title="הוספת קטגוריה חדשה"
        open={isNewCategoryModalOpen}
        onCancel={() =>
          setIsNewCategoryModalOpen(false)
        }
      >
        <AddCategory
          modalStateChanger={
            setIsNewCategoryModalOpen
          }
        />
      </Modal>

      <Modal
        destroyOnClose
        footer={null}
        centered
        title="הוספת תת-קטגוריה חדשה"
        open={isNewSubCategoryModalOpen}
        onCancel={() =>
          setIsNewSubCategoryModalOpen(false)
        }
      >
        <AddSubCategory
          modalStateChanger={
            setIsNewSubCategoryModalOpen
          }
          preSelectedCategory={selectedCategory}
        />
      </Modal>
    </div>
  );
}
