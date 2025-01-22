import YearsModel from "./YearsModel";

class DatesModel {
  public id?: string;
  public uid: string;
  public years: YearsModel[];

  public constructor(
    uid: string,
    years: YearsModel[],
    id?: string
  ) {
    this.uid = uid;
    this.years = years;
    this.id = id;
  }
}

export default DatesModel;
