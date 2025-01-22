import MonthModel from "./MonthModal";

class YearsModel {
  public year: string;
  public months: MonthModel[];

  public constructor(
    year: string,
    months: MonthModel[]
  ) {
    this.year = year;
    this.months = months;
  }
}

export default YearsModel;
