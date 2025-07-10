import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";
import { authStore } from "../Redux/AuthState";
import notifyService from "./NotifyService";
import SpendingModel from "../Models/SpendingModel";

class SpendingsService {
  public async addSpending(
    spending: SpendingModel
  ): Promise<string> {
    const addSpending = httpsCallable(
      functions,
      "addSpending"
    );

    spending.uid =
      authStore.getState().user?.uid || "";
    await addSpending(spending)
      .then((result) => {
        spending.id = result.data as string;
        notifyService.success(
          "הוצאה נוספה בהצלחה"
        );
      })
      .catch((error) => {
        notifyService.error(error);
        throw error;
      });

    return spending.id || "empty :(";
  }

  public async addPaymentsPlan(
    paymentPlan: any
  ): Promise<SpendingModel[]> {
    const addSpending = httpsCallable(
      functions,
      "addSpending"
    );

    const addedSpendings: SpendingModel[] = [];

    const uid =
      authStore.getState().user?.uid || "";

    const totalSum = paymentPlan.totalSum;
    const firstPayment = paymentPlan.firstPayment;
    const numberOfPayments =
      paymentPlan.numberOfPayments;
    let date = paymentPlan.date;
    const category = paymentPlan.category;
    const subCategory = paymentPlan.subCategory;
    const note = paymentPlan.note;

    const spending = new SpendingModel(
      uid,
      category,
      subCategory,
      date,
      firstPayment,
      note + " תשלום 1/" + numberOfPayments,
      false
    );

    await addSpending(spending).then((result) => {
      spending.id = result.data as string;
      addedSpendings.push(spending);
    });

    const newTotalSum = totalSum - firstPayment;

    for (let i = 2; i <= numberOfPayments; i++) {
      const nextDate = new Date(date);
      nextDate.setMonth(nextDate.getMonth() + 1);

      if (nextDate.getMonth() === 12) {
        nextDate.setFullYear(
          nextDate.getFullYear() + 1
        );
        nextDate.setMonth(0);
      }

      date = nextDate.toISOString().split("T")[0];

      const nextSpending = new SpendingModel(
        uid,
        category,
        subCategory,
        date,
        newTotalSum / (numberOfPayments - 1),
        note +
          " תשלום " +
          i +
          "/" +
          numberOfPayments,
        false
      );

      await addSpending(nextSpending).then(
        (result) => {
          nextSpending.id = result.data as string;
          addedSpendings.push(nextSpending);
        }
      );
    }

    notifyService.success(
      "תשלומים נוספים בהצלחה"
    );

    return addedSpendings;
  }

  public async updateSpending(
    spending: SpendingModel
  ): Promise<void> {
    const updateSpending = httpsCallable(
      functions,
      "updateSpending"
    );

    const date = new Date(
      spending.date.split(".").reverse().join("-")
    );
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    await updateSpending({
      spendingId: spending.id,
      category: spending.category,
      subCategory: spending.subCategory,
      date: date,
      sum: spending.sum,
      cash: spending.cash,
      note: spending.note,
      year: year,
      month: month,
    })
      .then(() => {
        notifyService.success(
          "ההוצאה עודכנה בהצלחה"
        );
      })
      .catch((error) => {
        notifyService.error(error);
        throw error;
      });
  }

  public async deleteSpending(
    spendingId: string
  ): Promise<void> {
    const deleteSpending = httpsCallable(
      functions,
      "deleteSpending"
    );

    await deleteSpending({
      spendingId,
    })
      .then(() => {
        notifyService.success(
          "הוצאה נמחקה בהצלחה"
        );
      })
      .catch((error) => {
        notifyService.error(error);
        throw error;
      });
  }
}

const spendingsService = new SpendingsService();
export default spendingsService;
