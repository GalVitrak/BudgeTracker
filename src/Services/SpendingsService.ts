import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";
import { authStore } from "../Redux/AuthState";
import notifyService from "./NotifyService";
import SpendingModel from "../Models/SpendingModel";
import dayjs from "dayjs";
import CategoryModel from "../Models/CategoryModel";

class SpendingsService {
  public async getSpendings(): Promise<
    SpendingModel[]
  > {
    const getSpendings = httpsCallable(
      functions,
      "getSpendings"
    );

    const uid = authStore.getState().user?.uid;

    let spendings: SpendingModel[] = [];

    if (!uid) {
      notifyService.error(
        "User is not logged in"
      );
      return spendings;
    }

    await getSpendings({ uid })
      .then((result) => {
        const data = result.data as [];
        data.forEach((spending: any) => {
          spendings.push(
            new SpendingModel(
              spending.uid,
              spending.category,
              spending.subCategory,
              dayjs
                .unix(spending.date._seconds)
                .format("DD.MM.YYYY"),
              spending.sum,
              spending.note,
              spending.id
            )
          );
        });
      })
      .catch((error) => {
        notifyService.error(error);
        throw error;
      });
    return spendings;
  }

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
}

const spendingsService = new SpendingsService();

export default spendingsService;
