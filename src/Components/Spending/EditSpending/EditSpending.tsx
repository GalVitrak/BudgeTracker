import "./EditSpending.css";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authStore } from "../../../Redux/AuthState";
import {
  collection,
  or,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import SpendingModel from "../../../Models/SpendingModel";
import notifyService from "../../../Services/NotifyService";
import { useCollectionData } from "react-firebase-hooks/firestore";
import CategoryModel from "../../../Models/CategoryModel";
import spendingsService from "../../../Services/SpendingsService";
import { Switch } from "antd";

interface EditSpendingProps {
  modalStateChanger: Function;
  spendingStateChanger: Function;
  spending: SpendingModel;
}

export function EditSpending(
  props: EditSpendingProps
): JSX.Element {
  const { register, handleSubmit, setValue } =
    useForm<SpendingModel>({
      defaultValues: {
        category: props.spending.category,
        subCategory: props.spending.subCategory,
        date: new Date(
          props.spending.date
            .split(".")
            .reverse()
            .join("-")
        )
          .toISOString()
          .split("T")[0],
        sum: props.spending.sum,
        note: props.spending.note,
        cash: Boolean(props.spending.cash),
      },
    });

  const [isSubmitting, setIsSubmitting] =
    useState(false);
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
  const [categoriesData, loading] =
    useCollectionData(q);
  const categories =
    categoriesData as CategoryModel[];
  const [selectedDate, setSelectedDate] =
    useState<string>(
      new Date(
        props.spending.date
          .split(".")
          .reverse()
          .join("-")
      )
        .toISOString()
        .split("T")[0]
    );
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel>();
  const [
    selectedSubCategory,
    setSelectedSubCategory,
  ] = useState(props.spending.subCategory);
  const [isCash, setIsCash] = useState<boolean>(
    Boolean(props.spending.cash)
  );

  useEffect(() => {
    if (categories && categories.length > 0) {
      const initialCategory = categories.find(
        (category) =>
          category.name ===
          props.spending.category
      );
      if (initialCategory) {
        setSelectedCategory(initialCategory);
        setSelectedSubCategory(
          props.spending.subCategory
        );
        setValue(
          "subCategory",
          props.spending.subCategory
        );
      }
    }
  }, [
    categories,
    props.spending.category,
    props.spending.subCategory,
    setValue,
  ]);

  async function send(spending: SpendingModel) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (
        spending.category === "" ||
        spending.subCategory === ""
      ) {
        notifyService.info(
          "בחר קטגוריה ותת קטגוריה"
        );
        return;
      }

      const date = new Intl.DateTimeFormat(
        "he-IL",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      ).format(new Date(selectedDate));

      spending.date = date;
      spending.id = props.spending.id;
      console.log(spending);

      await spendingsService.updateSpending(
        spending
      );
      props.spendingStateChanger(spending);
      props.modalStateChanger(false);
    } catch (error) {
      console.error(
        "Error updating spending:",
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="EditSpending">
      <form
        onSubmit={handleSubmit(send)}
        className="modal-form"
      >
        <div className="input-group">
          <select
            defaultValue={props.spending.category}
            className="input"
            {...register("category", {
              onChange: (e) => {
                const newCategory =
                  categories?.find(
                    (category) =>
                      category.name ===
                      e.target.value
                  );
                setSelectedCategory(newCategory);
                // Reset subcategory when category changes
                setValue("subCategory", "");
              },
            })}
          >
            {loading ? (
              <option
                key="loading-state"
                value=""
                disabled
              >
                טוען...
              </option>
            ) : (
              <>
                <option
                  key="category-default"
                  value=""
                  disabled
                >
                  בחר קטגוריה
                </option>
                {categories &&
                  categories.length > 0 &&
                  categories.map(
                    (category, index) => (
                      <option
                        key={
                          category.id
                            ? `category-${category.id}`
                            : `category-index-${index}`
                        }
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    )
                  )}
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
            value={selectedSubCategory}
            className="input"
            {...register("subCategory", {
              onChange: (e) => {
                setSelectedSubCategory(
                  e.target.value
                );
              },
            })}
          >
            <option
              key="subcategory-default"
              value=""
              disabled
            >
              בחר תת-קטגוריה
            </option>
            {selectedCategory?.subCategories
              ?.filter(
                (subCategory) =>
                  subCategory.uid?.includes(
                    uid || ""
                  ) ||
                  subCategory.uid?.includes(
                    "allUsers"
                  )
              )
              .map((subCategory, index) => (
                <option
                  key={`subcategory-${
                    selectedCategory.id || "noId"
                  }-${index}-${subCategory.name}`}
                  value={subCategory.name}
                >
                  {subCategory.name}
                </option>
              ))}
          </select>
          <label
            className="label"
            htmlFor="category"
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

        <div className="payment-toggle">
          <label>תשלום במזומן</label>
          <Switch
            checked={isCash}
            onChange={(checked) => {
              setIsCash(checked);
              setValue("cash", checked);
            }}
          />
        </div>

        <div className="input-group">
          <input
            required={false}
            className="input"
            type="text"
            {...register("note")}
          />
          <label className="label" htmlFor="note">
            הערה
          </label>
        </div>

        <div className="input-group">
          <button
            className="modern-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "מעדכן..." : "עדכן"}
          </button>
        </div>
      </form>
    </div>
  );
}
