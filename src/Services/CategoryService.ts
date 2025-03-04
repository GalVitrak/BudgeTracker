import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";
import CategoryModel from "../Models/CategoryModel";
import notifyService from "./NotifyService";

interface ErrorType {
  code?: string;
  message?: string;
  details?: any;
}

class CategoryService {
  public async addCategory(
    category: CategoryModel
  ): Promise<string> {
    try {


      // Create a plain object from the category model
      const categoryData = {
        name: category.name,
        uid: category.uid[0], // Cloud Function expects a single UID
        subCategories: category.subCategories.map(
          (sub) => ({
            name: sub.name,
            uid: [sub.uid[0]], // Ensure subcategory UIDs are arrays
            isDefault: sub.isDefault || false,
          })
        ),
        isDefault: category.isDefault || false,
      };



      const addCategory = httpsCallable(
        functions,
        "addCategory"
      );

  
      const result = await addCategory(
        categoryData
      );
     

      notifyService.success(
        "קטגוריה נוספה בהצלחה"
      );
      return result.data as string;
    } catch (error: any) {
      console.error(
        "CategoryService: Error in addCategory:",
        error
      );
      notifyService.error({
        message: "שגיאה בהוספת קטגוריה",
        details: error as ErrorType,
      });
      throw error;
    }
  }

  public async addSubCategory(
    categoryId: string,
    subCategoryName: string,
    uid: string
  ): Promise<void> {
    const addSubCategory = httpsCallable(
      functions,
      "addSubCategory"
    );

    try {
      await addSubCategory({
        categoryId,
        newSubCategory: {
          name: subCategoryName,
          uid: [uid],
          isDefault: false,
        },
      });

      notifyService.success(
        "תת-קטגוריה נוספה בהצלחה"
      );
    } catch (error) {
      notifyService.error({
        message: "שגיאה בהוספת תת-קטגוריה",
        details: error as ErrorType,
      });
      throw error;
    }
  }

  public async updateCategory(
    category: CategoryModel,
    newName: string
  ): Promise<void> {
    const updateCategory = httpsCallable(
      functions,
      "updateCategory"
    );

    try {
      if (!category.id) {
        throw new Error("Category ID is missing");
      }

      await updateCategory({
        categoryId: category.id,
        name: newName,
        uid: category.uid[0], // Send first UID since we're updating from that user's context
      });

      notifyService.success(
        "קטגוריה עודכנה בהצלחה"
      );
    } catch (error) {
      notifyService.error({
        message: "שגיאה בעדכון קטגוריה",
        details: error as ErrorType,
      });
      throw error;
    }
  }

  public async deleteCategory(
    categoryId: string,
    uid: string
  ): Promise<void> {
    const deleteCategory = httpsCallable(
      functions,
      "deleteCategory"
    );

    try {
      await deleteCategory({
        categoryId,
        uid,
      });

      notifyService.success(
        "קטגוריה נמחקה בהצלחה"
      );
    } catch (error) {
      notifyService.error({
        message: "שגיאה במחיקת קטגוריה",
        details: error as ErrorType,
      });
      throw error;
    }
  }

  public async deleteSubCategory(
    categoryId: string,
    subCategoryName: string,
    uid: string
  ): Promise<void> {
    const deleteSubCategory = httpsCallable(
      functions,
      "deleteSubCategory"
    );

    try {
      await deleteSubCategory({
        categoryId,
        subCategoryName,
        uid,
      });

      notifyService.success(
        "תת-קטגוריה נמחקה בהצלחה"
      );
    } catch (error) {
      notifyService.error({
        message: "שגיאה במחיקת תת-קטגוריה",
        details: error as ErrorType,
      });
      throw error;
    }
  }
}

const categoryService = new CategoryService();
export default categoryService;
