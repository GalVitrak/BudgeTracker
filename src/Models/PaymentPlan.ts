class PaymentPlan {
  totalSum: number;
  firstPayment: number;
  numberOfPayments: number;
  date: string;
  category: string;
  subCategory: string;
  note: string;

  public constructor(
    totalSum: number,
    firstPayment: number,
    numberOfPayments: number,
    date: string,
    category: string,
    subCategory: string,
    note: string
  ) {
    this.totalSum = totalSum;
    this.firstPayment = firstPayment;
    this.numberOfPayments = numberOfPayments;
    this.date = date;
    this.category = category;
    this.subCategory = subCategory;
    this.note = note;
  }
}

export default PaymentPlan;
