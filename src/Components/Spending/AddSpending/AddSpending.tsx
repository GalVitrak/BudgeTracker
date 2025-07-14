import "./AddSpending.css";
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
import { Modal } from "antd";
import { useCollectionData } from "react-firebase-hooks/firestore";
import CategoryModel from "../../../Models/CategoryModel";
import PaymentPlan from "../../../Models/PaymentPlan";
import spendingsService from "../../../Services/SpendingsService";
import { AddCategory } from "../../Categories/AddCategory/AddCategory";
import { AddSubCategory } from "../../Categories/AddSubCategory/AddSubCategory";
import { Switch } from "antd";

interface addSpendingProps {
  modalStateChanger: Function;
  spendingStateChanger: Function;
}

export function AddSpending(
  props: addSpendingProps
): JSX.Element {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryModel | undefined>(
      undefined
    );
  const [
    selectedSubCategory,
    setSelectedSubCategory,
  ] = useState<string>("default");
  const [selectedDate, setSelectedDate] =
    useState(
      new Date().toISOString().split("T")[0]
    );
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isPayment, setIsPayment] =
    useState<boolean>(false);
  const [isCash, setIsCash] =
    useState<boolean>(false);
  const [totalPayments, setTotalPayments] =
    useState<number>(2);
  const [firstPayment, setFirstPayment] =
    useState<number>(1);
  const [
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
  ] = useState(false);
  const [
    isAddSubCategoryModalOpen,
    setIsAddSubCategoryModalOpen,
  ] = useState(false);

  const { register, handleSubmit, getValues } =
    useForm<SpendingModel>({
      defaultValues: {
        note: "",
        category: "",
        subCategory: "",
        date: selectedDate,
      },
    });

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

  useEffect(() => {}, [selectedCategory]);


  async function send(spending: SpendingModel) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!uid) {
        notifyService.error({
          message: "משתמש לא מחובר",
        });
        return;
      }

      if (!selectedCategory) {
        notifyService.info("בחר קטגוריה");
        return;
      }

      if (
        isPayment &&
        (!firstPayment || !totalPayments)
      ) {
        notifyService.error({
          message: "יש להזין את פרטי התשלומים",
        });
        return;
      }

      if (isPayment) {
        // creates a payments plan object

        const paymentsPlan = new PaymentPlan(
          spending.sum,
          firstPayment,
          totalPayments,
          spending.date,
          spending.category,
          spending.subCategory,
          spending.note
        );

        const addedSpendings =
          await spendingsService.addPaymentsPlan(
            paymentsPlan
          );

        props.spendingStateChanger(
          addedSpendings[0]
        );
      } else {
        const newSpending = new SpendingModel(
          uid,
          spending.category,
          spending.subCategory,
          spending.date,
          spending.sum,
          spending.note,
          isCash
        );

        await spendingsService.addSpending(
          newSpending
        );
        props.spendingStateChanger(newSpending);
      }

      props.modalStateChanger(false);
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
                  setIsAddCategoryModalOpen(true);
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
                  setIsAddSubCategoryModalOpen(
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
            {selectedCategory?.subCategories
              ?.filter(
                (subCategory) =>
                  subCategory.isDefault ===
                    true || // Show default subcategories
                  subCategory.uid?.includes(
                    uid || ""
                  ) // Show only user's own subcategories
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
            {...register("sum", {
              valueAsNumber: true,
            })}
          />
          <label className="label" htmlFor="sum">
            סכום
          </label>
        </div>

        {!isPayment && (
          <div className="payment-toggle">
            <label>תשלום במזומן</label>
            <Switch
              checked={isCash}
              onChange={(checked) => {
                setIsCash(checked);
              }}
            />
          </div>
        )}

        {!isCash && (
          <div className="payment-toggle">
            <label>תשלומים</label>
            <Switch
              checked={isPayment}
              onChange={(checked) => {
                setIsPayment(checked);
                if (!checked) {
                  setTotalPayments(1);
                  setFirstPayment(0);
                }
              }}
            />
          </div>
        )}

        {isPayment && (
          <>
            <div className="input-group">
              <select
                className="input"
                value={totalPayments}
                onChange={(e) => {
                  setTotalPayments(
                    Number(e.target.value)
                  );
                }}
              >
                {Array.from(
                  { length: 35 },
                  (_, i) => i + 2
                ).map((num) => (
                  <option key={num} value={num}>
                    {num} תשלומים
                  </option>
                ))}
              </select>
              <label className="label">
                מספר תשלומים
              </label>
            </div>

            <div className="input-group">
              <input
                name="firstPayment"
                className="input"
                required
                type="number"
                step={0.01}
                min={1}
                value={firstPayment}
                onChange={(e) => {
                  const value = Number(
                    e.target.value
                  );
                  const totalSum = Number(
                    getValues("sum")
                  );
                  if (value > totalSum) {
                    notifyService.error({
                      message:
                        "התשלום הראשון לא יכול להיות גדול מהסכום הכולל",
                    });
                    return;
                  }
                  setFirstPayment(value);
                }}
              />
              <label
                className="label"
                htmlFor="firstPayment"
              >
                תשלום ראשון
              </label>
            </div>
          </>
        )}

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
        open={isAddCategoryModalOpen}
        onCancel={() =>
          setIsAddCategoryModalOpen(false)
        }
      >
        <AddCategory
          modalStateChanger={
            setIsAddCategoryModalOpen
          }
        />
      </Modal>

      <Modal
        destroyOnClose
        footer={null}
        centered
        title="הוספת תת-קטגוריה חדשה"
        open={isAddSubCategoryModalOpen}
        onCancel={() =>
          setIsAddSubCategoryModalOpen(false)
        }
      >
        <AddSubCategory
          modalStateChanger={
            setIsAddSubCategoryModalOpen
          }
          preSelectedCategory={selectedCategory}
          setSelectedCategory={
            setSelectedCategory
          }
        />
      </Modal>
    </div>
  );
}
