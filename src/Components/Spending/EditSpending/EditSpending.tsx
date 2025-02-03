import { useForm } from "react-hook-form";
import "../../../Styles/SharedModals.css";
import "./EditSpending.css";
import SpendingModel from "../../../Models/SpendingModel";
import CategoryModel from "../../../Models/CategoryModel";
import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { collection, doc, query, updateDoc, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../../../../firebase-config";
import { authStore } from "../../../Redux/AuthState";
import notifyService from "../../../Services/NotifyService";

interface EditSpendingProps {
  modalStateChanger: Function;
  spendingStateChanger: Function;
  spending: SpendingModel;
}

export function EditSpending(props: EditSpendingProps): JSX.Element {
  const { register, handleSubmit } = useForm<SpendingModel>({
    defaultValues: {
      category: props.spending.category,
      subCategory: props.spending.subCategory,
      date: new Date(props.spending.date.split(".").reverse().join("-")).toISOString().split("T")[0],
      sum: props.spending.sum,
      note: props.spending.note,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const uid = authStore.getState().user?.uid;
  const categoriesRef = collection(db, "categories");
  const q = query(categoriesRef, where("uid", "in", ["allUsers", uid]));
  const [categoriesData, loading] = useCollectionData(q);
  const categories = categoriesData as CategoryModel[];
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(props.spending.date.split(".").reverse().join("-")).toISOString().split("T")[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryModel>();

  useEffect(() => {
    if (categories) {
      setSelectedCategory(
        categories.find((category) => category.name === props.spending.category)
      );
    }
  }, [categories, props.spending.category]);

  async function send(spending: SpendingModel) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (spending.category === "" || spending.subCategory === "") {
        notifyService.info("בחר קטגוריה ותת קטגוריה");
        return;
      }

      const year = selectedDate.split("-")[0];
      const month = selectedDate.split("-")[1];
      spending.year = year;
      spending.month = month;
      
      const spendingRef = doc(db, "spendings", props.spending.id);
      await updateDoc(spendingRef, {
        category: spending.category,
        subCategory: spending.subCategory,
        date: new Date(selectedDate),
        sum: spending.sum,
        note: spending.note,
        year: spending.year,
        month: spending.month,
      });

      const date = new Intl.DateTimeFormat("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(selectedDate));
      
      spending.date = date;
      spending.id = props.spending.id;

      props.spendingStateChanger(spending);
      props.modalStateChanger(false);
      notifyService.success("ההוצאה עודכנה בהצלחה");
    } catch (error) {
      console.error("Error updating spending:", error);
      notifyService.error("שגיאה בעדכון ההוצאה");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="EditSpending">
      <form onSubmit={handleSubmit(send)} className="modal-form">
        <div className="input-group">
          <select
            defaultValue={props.spending.category}
            className="input"
            {...register("category", {
              onChange: (e) => {
                setSelectedCategory(
                  categories?.find((category) => category.name === e.target.value)
                );
              },
            })}
          >
            {loading && (
              <option key={"loading"}>
                <LoadingOutlined />
              </option>
            )}
            <option key={"select"} value="" disabled>
              בחר קטגוריה
            </option>
            {categories?.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <label className="label" htmlFor="category">
            קטגוריה
          </label>
        </div>

        <div className="input-group">
          <select
            defaultValue={props.spending.subCategory}
            className="input"
            {...register("subCategory")}
          >
            <option key={"select"} value="" disabled>
              בחר תת-קטגוריה
            </option>
            {selectedCategory?.subCategories?.map((subCategory) => (
              <option key={subCategory.name} value={subCategory.name}>
                {subCategory.name}
              </option>
            ))}
          </select>
          <label className="label" htmlFor="category">
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
            required
            className="input"
            type="text"
            {...register("note")}
          />
          <label className="label" htmlFor="note">
            הערה
          </label>
        </div>

        <div className="input-group">
          <button className="input" disabled={isSubmitting}>
            {isSubmitting ? "מעדכן..." : "עדכן"}
          </button>
        </div>
      </form>
    </div>
  );
} 