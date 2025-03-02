class subCategoriesModel {
  name: string;
  uid: string[]; // Array of user IDs who use this subcategory
  isDefault?: boolean; // To mark default subcategories that can't be deleted

  constructor(
    name: string,
    uid: string[],
    isDefault?: boolean
  ) {
    this.name = name;
    this.uid = uid;
    this.isDefault = isDefault;
  }
}

export default subCategoriesModel;
