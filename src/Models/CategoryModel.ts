import subCategoriesModel from "./SubCategoryModel";

class CategoryModel {
  public id?: string;
  public uid: string[]; // Array of user IDs who use this category
  public name: string;
  public subCategories: subCategoriesModel[];
  public isDefault?: boolean; // To mark default categories that can't be deleted

  public constructor(
    uid: string[],
    name: string,
    subCategories: subCategoriesModel[],
    id?: string,
    isDefault?: boolean
  ) {
    this.uid = uid;
    this.name = name;
    this.subCategories = subCategories;
    this.id = id;
    this.isDefault = isDefault;
  }
}

export default CategoryModel;
