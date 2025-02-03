import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";
import { authStore } from "../Redux/AuthState";
import notifyService from "./NotifyService";
import SpendingModel from "../Models/SpendingModel";
import CategoryModel from "../Models/CategoryModel";

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

  public async addCategory(
    category: CategoryModel
  ): Promise<string> {
    const addCategory = httpsCallable(
      functions,
      "addCategory"
    );

    await addCategory(category)
      .then(() => {
        notifyService.success(
          "קטגוריה נוספה בהצלחה"
        );
      })
      .catch((error) => {
        notifyService.error(error);
        throw error;
      });

    return category.id || "empty :(";
  }

  public async addSubCategory(
    category: CategoryModel
  ): Promise<string> {
    const addSubCategory = httpsCallable(
      functions,
      "addSubCategory"
    );

    await addSubCategory(category)
      .then(() => {
        notifyService.success(
          "תת קטגוריה נוספה בהצלחה"
        );
      })
      .catch((error) => {
        notifyService.error(error);
        throw error;
      });
    return "empty :(";
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
