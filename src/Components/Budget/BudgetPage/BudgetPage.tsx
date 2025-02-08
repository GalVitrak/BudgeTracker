import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";
import "./BudgetPage.css";
import {
  Card,
  Input,
  Spin,
  Progress,
  Statistic,
} from "antd";
import {
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import { authStore } from "../../../Redux/AuthState";
import { useCollection } from "react-firebase-hooks/firestore";
import CategoryModel from "../../../Models/CategoryModel";
import BudgetModel from "../../../Models/BudgetModel";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../../firebase-config";
import notifyService from "../../../Services/NotifyService";

// Move SubCategoryInput outside of the main component
const SubCategoryInput = memo(
  ({
    subCategory,
    categoryId,
    onBudgetChange,
  }: {
    subCategory: { name: string; budget: number };
    categoryId: string;
    onBudgetChange: (
      categoryId: string,
      name: string,
      value: number
    ) => void;
  }) => {
    const [localValue, setLocalValue] = useState(
      subCategory.budget
    );

    useEffect(() => {
      setLocalValue(subCategory.budget);
    }, [subCategory.budget]);

    const handleChange = useCallback(
      (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        const newValue =
          e.target.value === ""
            ? 0
            : Number(e.target.value);
        setLocalValue(newValue);
      },
      []
    );

    const handleBlur = useCallback(() => {
      if (localValue !== subCategory.budget) {
        onBudgetChange(
          categoryId,
          subCategory.name,
          localValue
        );
      }
    }, [
      categoryId,
      subCategory.name,
      localValue,
      subCategory.budget,
      onBudgetChange,
    ]);

    return (
      <div className="sub-budget-input-group">
        <label>{subCategory.name}</label>
        <Input
          type="number"
          min={0}
          step={1}
          prefix="₪"
          value={
            localValue === 0 ? 0 : localValue
          }
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.categoryId ===
        nextProps.categoryId &&
      prevProps.subCategory.name ===
        nextProps.subCategory.name &&
      prevProps.subCategory.budget ===
        nextProps.subCategory.budget
    );
  }
);

interface BudgetData {
  categoryId: string;
  monthlyBudget: number;
  subCategories: Array<{
    name: string;
    budget: number;
  }>;
  uid?: string;
  totalMonthlyBudget?: number;
  savingsGoal?: number;
}

interface FirestoreData {
  uid: string;
  totalMonthlyBudget: number;
  savingsGoal: number;
  budgets?: BudgetData[];
  updatedAt?: { toDate: () => Date };
}

export function BudgetPage(): JSX.Element {
  const [budgets, setBudgets] = useState<
    BudgetModel[]
  >([]);
  const [
    totalMonthlyBudget,
    setTotalMonthlyBudget,
  ] = useState(0);
  const [savingsGoal, setSavingsGoal] =
    useState(0);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);
  const [collapsedCards, setCollapsedCards] =
    useState<Set<string>>(new Set());
  const uid = authStore.getState().user?.uid;

  // Fetch categories
  const categoriesRef = collection(
    db,
    "categories"
  );
  const q = query(
    categoriesRef,
    where("uid", "in", ["allUsers", uid])
  );
  const [snapshot, loading] = useCollection(q);

  // Memoize the categories array
  const categories = useMemo(
    () =>
      snapshot?.docs.map(
        (doc) =>
          new CategoryModel(
            doc.data().uid,
            doc.data().name,
            doc.data().subCategories,
            doc.id
          )
      ) || [],
    [snapshot]
  );

  // Fetch existing budgets
  const budgetsRef = collection(db, "budgets");
  const budgetQuery = query(
    budgetsRef,
    where("__name__", "==", uid)
  );
  const [budgetSnapshot, budgetLoading] =
    useCollection(budgetQuery);

  // Memoize calculations
  const calculateCategoryTotal = useMemo(
    () => (budget: BudgetModel) => {
      return budget.subCategories.reduce(
        (total, sub) => total + (sub.budget || 0),
        0
      );
    },
    []
  );

  const calculateTotalAllocated = useMemo(
    () => () => {
      return (
        budgets.reduce(
          (total, budget) =>
            total +
            calculateCategoryTotal(budget),
          0
        ) + savingsGoal
      );
    },
    [budgets, savingsGoal, calculateCategoryTotal]
  );

  const getRemainingBudget = useMemo(
    () => () => {
      return (
        totalMonthlyBudget -
        calculateTotalAllocated()
      );
    },
    [totalMonthlyBudget, calculateTotalAllocated]
  );

  const getBudgetAllocationPercentage = useMemo(
    () => () => {
      if (totalMonthlyBudget === 0) return 0;
      return Number(
        (
          (calculateTotalAllocated() /
            totalMonthlyBudget) *
          100
        ).toFixed(1)
      );
    },
    [totalMonthlyBudget, calculateTotalAllocated]
  );

  const isUnusedCategory = useMemo(
    () => (budget: BudgetModel) => {
      return calculateCategoryTotal(budget) === 0;
    },
    [calculateCategoryTotal]
  );

  const handleSubBudgetChange = useCallback(
    (
      categoryId: string,
      name: string,
      value: number
    ) => {
      setBudgets((prevBudgets) =>
        prevBudgets.map((budget) => {
          if (budget.categoryId !== categoryId)
            return budget;
          return {
            ...budget,
            subCategories:
              budget.subCategories.map((sub) =>
                sub.name === name
                  ? { ...sub, budget: value }
                  : sub
              ),
          };
        })
      );
    },
    []
  );

  const BudgetCardContent = memo(
    ({
      budget,
      onBudgetChange,
    }: {
      budget: BudgetModel;
      onBudgetChange: (
        categoryId: string,
        name: string,
        value: number
      ) => void;
    }) => {
      const total = useMemo(
        () =>
          budget.subCategories.reduce(
            (sum, sub) => sum + (sub.budget || 0),
            0
          ),
        [budget.subCategories]
      );

      return (
        <>
          <div className="sub-categories">
            {budget.subCategories.map(
              (subCategory) => (
                <SubCategoryInput
                  key={`${budget.categoryId}-${subCategory.name}`}
                  subCategory={subCategory}
                  categoryId={budget.categoryId}
                  onBudgetChange={onBudgetChange}
                />
              )
            )}
          </div>
          <div className="category-total-section">
            <Statistic
              className="category-total-statistic"
              title="סה״כ תקציב קטגוריה"
              value={total}
              prefix="₪"
            />
          </div>
        </>
      );
    },
    (prevProps, nextProps) => {
      if (
        prevProps.budget.categoryId !==
        nextProps.budget.categoryId
      )
        return false;
      if (
        prevProps.budget.subCategories.length !==
        nextProps.budget.subCategories.length
      )
        return false;

      return prevProps.budget.subCategories.every(
        (sub, index) => {
          const nextSub =
            nextProps.budget.subCategories[index];
          return (
            sub.name === nextSub.name &&
            sub.budget === nextSub.budget
          );
        }
      );
    }
  );

  // Consolidate data initialization into a single effect
  useEffect(() => {
    if (!categories.length) return;

    // Initialize collapsed cards
    setCollapsedCards(
      new Set(
        categories.map((cat) => cat.id || "")
      )
    );

    if (budgetLoading) return;

    if (budgetSnapshot?.docs[0]) {
      // Handle existing budget data
      const data =
        budgetSnapshot.docs[0].data() as FirestoreData;
      setTotalMonthlyBudget(
        data.totalMonthlyBudget || 0
      );
      setSavingsGoal(data.savingsGoal || 0);
      setLastUpdated(
        data.updatedAt?.toDate() || null
      );

      const existingBudgets = new Map(
        (data.budgets || []).map(
          (budget: BudgetData) => [
            budget.categoryId,
            budget,
          ]
        )
      );

      const mergedBudgets = categories.map(
        (category) => {
          const existingBudget =
            existingBudgets.get(
              category.id || ""
            );
          return new BudgetModel(
            data.uid,
            data.totalMonthlyBudget || 0,
            data.savingsGoal || 0,
            category.id,
            category.name,
            existingBudget?.monthlyBudget || 0,
            category.subCategories?.map(
              (sub) => ({
                name: sub.name,
                budget:
                  existingBudget?.subCategories?.find(
                    (s: { name: string }) =>
                      s.name === sub.name
                  )?.budget || 0,
              })
            ) || []
          );
        }
      );

      setBudgets(mergedBudgets);
    } else {
      // Handle new budget initialization
      const newBudgets = categories.map(
        (category) =>
          new BudgetModel(
            uid || "",
            0,
            0,
            category.id,
            category.name,
            0,
            category.subCategories?.map(
              (sub) => ({
                name: sub.name,
                budget: 0,
              })
            ) || []
          )
      );
      setBudgets(newBudgets);
    }
  }, [
    categories,
    budgetSnapshot,
    budgetLoading,
    uid,
  ]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (
      calculateTotalAllocated() >
      totalMonthlyBudget
    ) {
      notifyService.error({
        message:
          "סך התקציבים שהוקצו גדול מהתקציב החודשי הכולל",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const setBudgetFn = httpsCallable(
        functions,
        "setBudget"
      );

      await setBudgetFn({
        uid,
        totalMonthlyBudget,
        savingsGoal,
        budgets: budgets.map((b) => ({
          categoryId: b.categoryId,
          categoryName: b.categoryName,
          monthlyBudget: b.monthlyBudget,
          subCategories: b.subCategories,
        })),
      });

      notifyService.success("התקציב נשמר בהצלחה");
    } catch (error) {
      console.error(
        "Error saving budgets:",
        error
      );
      notifyService.error({
        message: "שגיאה בשמירת התקציב",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCardCollapse = useCallback(
    (categoryId: string) => {
      setCollapsedCards((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(categoryId)) {
          newSet.delete(categoryId);
        } else {
          newSet.add(categoryId);
        }
        return newSet;
      });
    },
    []
  );

  if (loading || budgetLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="BudgetPage">
      <h1>הגדרת תקציב חודשי</h1>

      <div className="total-budget-container">
        <Card className="total-budget-card">
          {lastUpdated && (
            <div className="last-updated">
              עודכן לאחרונה:{" "}
              {new Intl.DateTimeFormat("he-IL", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(lastUpdated)}
            </div>
          )}
          <div className="total-budget-section">
            <div className="budget-input-group">
              <label>
                תקציב חודשי כולל (משכורת)
              </label>
              <Input
                type="number"
                value={totalMonthlyBudget || ""}
                onChange={(e) =>
                  setTotalMonthlyBudget(
                    e.target.value === ""
                      ? 0
                      : Number(e.target.value)
                  )
                }
                min={0}
                step={1}
                prefix="₪"
              />
            </div>

            <div className="budget-input-group">
              <label>יעד חיסכון חודשי</label>
              <Input
                type="number"
                value={savingsGoal || ""}
                onChange={(e) =>
                  setSavingsGoal(
                    e.target.value === ""
                      ? 0
                      : Number(e.target.value)
                  )
                }
                min={0}
                step={1}
                prefix="₪"
              />
            </div>
          </div>

          <div className="budget-summary">
            <div className="summary-item">
              <span>סה"כ הוקצה:</span>
              <span>
                ₪{calculateTotalAllocated()}
              </span>
            </div>
            <div className="summary-item">
              <span>נותר להקצאה:</span>
              <span>₪{getRemainingBudget()}</span>
            </div>
            <Progress
              percent={getBudgetAllocationPercentage()}
              status={
                getBudgetAllocationPercentage() >
                100
                  ? "exception"
                  : "active"
              }
              strokeColor={{
                "0%": "#108ee9",
                "100%":
                  getBudgetAllocationPercentage() >
                  100
                    ? "#ff4d4f"
                    : "#87d068",
              }}
            />
          </div>
        </Card>
      </div>

      <div className="budget-page-container">
        <div className="budgets-container">
          {budgets.map((budget) => {
            const isCollapsed =
              collapsedCards.has(
                budget.categoryId
              );
            const unused =
              isUnusedCategory(budget);

            return (
              <Card
                key={budget.categoryId}
                title={
                  <div className="card-header">
                    <span>
                      {budget.categoryName}
                    </span>
                    <button
                      className="collapse-button"
                      onClick={() =>
                        toggleCardCollapse(
                          budget.categoryId
                        )
                      }
                    >
                      {isCollapsed ? (
                        <DownOutlined />
                      ) : (
                        <UpOutlined />
                      )}
                    </button>
                  </div>
                }
                className={`budget-card ${
                  unused ? "unused-category" : ""
                } ${
                  isCollapsed ? "collapsed" : ""
                }`}
              >
                {isCollapsed ? (
                  <div className="collapsed-summary">
                    <span className="label">
                      סה"כ תקציב:
                    </span>
                    <span className="total-amount">
                      ₪
                      {calculateCategoryTotal(
                        budget
                      )}
                    </span>
                  </div>
                ) : (
                  <BudgetCardContent
                    budget={budget}
                    onBudgetChange={
                      handleSubBudgetChange
                    }
                  />
                )}
              </Card>
            );
          })}
        </div>

        <div className="submit-container">
          <button
            onClick={handleSubmit}
            disabled={
              getBudgetAllocationPercentage() >
              100
            }
            className="modern-button"
          >
            שמור תקציב
          </button>
        </div>
      </div>
    </div>
  );
}
