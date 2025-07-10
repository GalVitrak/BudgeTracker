class SpendingModel {
  id?: string;
  uid: string;
  category: string;
  subCategory: string;
  date: string;
  year: string | number;
  month: string | number;
  sum: number;
  cash: boolean;
  note: string;

  public constructor(
    uid: string,
    category: string,
    subCategory: string,
    date: string,
    sum: number,
    note: string,
    cash: boolean,
    id?: string
  ) {
    this.uid = uid;
    this.category = category;
    this.subCategory = subCategory;
    this.date = date;
    this.year = date.split(".")[2];
    this.month = date.split(".")[1];
    this.sum = sum;
    this.note = note;
    this.cash = cash;
    this.id = id;
  }
}

export default SpendingModel;
