class BudgetModel {
  public constructor(
    public uid: string = "",
    public totalMonthlyBudget: number = 0,
    public savingsGoal: number = 0,
    public categoryId: string = "",
    public categoryName: string = "",
    public monthlyBudget: number = 0,
    public subCategories: {
      name: string;
      budget: number;
    }[] = [],
    public id?: string
  ) {}
}

export default BudgetModel;
