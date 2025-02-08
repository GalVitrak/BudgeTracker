class SpendingModel {
  id: string;
  uid: string;
  category: string;
  subCategory: string;
  date: string;
  year: string | number;
  month: string | number;
  sum: number;
  note: string;

  public constructor(
    uid: string,
    category: string,
    subCategory: string,
    date: string,
    sum: number,
    note: string,
    id: string
  ) {
    this.uid = uid;
    this.category = category;
    this.subCategory = subCategory;
    this.date = date;
    this.year = date.split(".")[2];
    this.month = date.split(".")[1];
    this.sum = sum;
    this.note = note;
    this.id = id;
  }
}

export default SpendingModel;
