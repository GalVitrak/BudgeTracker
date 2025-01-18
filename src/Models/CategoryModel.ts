import subCategoriesModel from "./SubCategoryModel";

class CategoryModel {
  public id?: string;
  public uid: string;
  public name: string;
  public subCategories: subCategoriesModel[];

  public constructor(
    uid: string,
    name: string,
    subCategories: subCategoriesModel[],
    id?: string
  ) {
    this.uid = uid;
    this.name = name;
    this.subCategories = subCategories;
    this.id = id;
  }
}

export default CategoryModel;
