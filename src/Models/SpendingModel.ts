class SpendingModel {
  id?: string;
  uid: string;
  category: string;
  subCategory: string;
  date: string;
  sum: number;
  note: string;

  public constructor(
    uid: string,
    category: string,
    subCategory: string,
    date: string,
    sum: number,
    note: string,
    id?: string
  ) {
    this.uid = uid;
    this.category = category;
    this.subCategory = subCategory;
    this.date = date;
    this.sum = sum;
    this.note = note;
    this.id = id;
  }
}

export default SpendingModel;
