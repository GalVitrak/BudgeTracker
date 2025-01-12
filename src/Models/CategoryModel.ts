import subCategoriesModel from "./SubCategoryModel";

class CategoryModel {
  public id: string;
  public uid: string;
  public name: string;
  public subCategories: subCategoriesModel[];

  public constructor(
    id: string,
    uid: string,
    name: string,
    subCategories: subCategoriesModel[]
  ) {
    this.id = id;
    this.uid = uid;
    this.name = name;
    this.subCategories = subCategories;
  }
}

export default CategoryModel;
