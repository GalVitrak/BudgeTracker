import { useEffect, useState } from "react";
import "./BudgetGraph.css";
import { LoadingOutlined } from "@ant-design/icons";
import {
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import { authStore } from "../../../Redux/AuthState";
import { useCollection } from "react-firebase-hooks/firestore";
import DatesModel from "../../../Models/DatesModel";
import YearsModel from "../../../Models/YearsModel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import SpendingModel from "../../../Models/SpendingModel";
import BudgetModel from "../../../Models/BudgetModel";
import "../../../Styles/SharedModals.css";
import { getCategoryEmoji } from "../../../Utils/CategoryUtils";
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

function BudgetGraph(): JSX.Element {
  const [dates, setDates] =
    useState<DatesModel>();
  const [datesYear, setDatesYear] =
    useState<YearsModel>();
  const [selectedMonth, setSelectedMonth] =
    useState<string>("");
  const [selectedYear, setSelectedYear] =
    useState<string>("");
  const [chartData, setChartData] = useState<
    any[]
  >([]);
  const [budgets, setBudgets] = useState<
    BudgetModel[]
  >([]);

  const uid = authStore.getState().user?.uid;

  // Firebase queries
  const datesRef = collection(db, "dates");
  const datesQuery = query(
    datesRef,
    where("uid", "==", uid)
  );

  const spendingRef = collection(db, "spendings");
  const spendingQuery = query(
    spendingRef,
    where("uid", "==", uid),
    where(
      "year",
      "==",
      selectedYear ? Number(selectedYear) : 0
    ),
    where(
      "month",
      "==",
      selectedMonth ? Number(selectedMonth) : 0
    )
  );

  const budgetsRef = collection(db, "budgets");
  const budgetQuery = query(
    budgetsRef,
    where("__name__", "==", uid)
  );

  const [datesSnapshot] =
    useCollection(datesQuery);
  const [spendingSnapshot] = useCollection(
    spendingQuery
  );
  const [budgetSnapshot] =
    useCollection(budgetQuery);

  // Set default year and month on component mount
  useEffect(() => {
    if (!datesSnapshot?.docs[0]) return;

    const date = new DatesModel(
      datesSnapshot.docs[0].data().uid,
      datesSnapshot.docs[0].data().years,
      datesSnapshot.docs[0].id
    );
    setDates(date);

    // Sort years in descending order
    const sortedYears = [...date.years].sort(
      (a, b) => Number(b.year) - Number(a.year)
    );

    if (!selectedYear || !selectedMonth) {
      const currentDate = new Date();
      const currentYear =
        currentDate.getFullYear();
      const currentMonth = (
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0");

      // Try to find current year in available years
      const currentYearData = sortedYears.find(
        (y) => Number(y.year) === currentYear
      );

      if (currentYearData) {
        // Current year exists, use it
        setSelectedYear(currentYear.toString());
        setDatesYear(currentYearData);

        // Sort months numerically
        const sortedMonths = [
          ...currentYearData.months,
        ].sort(
          (a, b) =>
            Number(a.month) - Number(b.month)
        );

        // Check if current month exists
        const hasCurrentMonth = sortedMonths.some(
          (m) => m.month === currentMonth
        );

        if (hasCurrentMonth) {
          // Current month exists, use it
          setSelectedMonth(currentMonth);
        } else {
          // Find the closest future month
          const futureMonths =
            sortedMonths.filter(
              (m) =>
                Number(m.month) >=
                Number(currentMonth)
            );

          if (futureMonths.length > 0) {
            // Found a future month in current year
            setSelectedMonth(
              futureMonths[0].month
            );
          } else {
            // No future months, get the first month of next year if available
            const nextYear = sortedYears.find(
              (y) => Number(y.year) > currentYear
            );

            if (nextYear) {
              setSelectedYear(
                nextYear.year.toString()
              );
              setDatesYear(nextYear);
              const nextYearMonths = [
                ...nextYear.months,
              ].sort(
                (a, b) =>
                  Number(a.month) -
                  Number(b.month)
              );
              if (nextYearMonths.length > 0) {
                setSelectedMonth(
                  nextYearMonths[0].month
                );
              }
            } else {
              // No future months in any year, fallback to most recent month
              const pastMonths =
                sortedMonths.sort(
                  (a, b) =>
                    Number(b.month) -
                    Number(a.month)
                );
              if (pastMonths.length > 0) {
                setSelectedMonth(
                  pastMonths[0].month
                );
              }
            }
          }
        }
      } else {
        // Current year not available, try to find next available year
        const futureYears = sortedYears.filter(
          (y) => Number(y.year) >= currentYear
        );

        if (futureYears.length > 0) {
          const nextYear = futureYears[0];
          setSelectedYear(
            nextYear.year.toString()
          );
          setDatesYear(nextYear);

          const sortedMonths = [
            ...nextYear.months,
          ].sort(
            (a, b) =>
              Number(a.month) - Number(b.month)
          );
          if (sortedMonths.length > 0) {
            setSelectedMonth(
              sortedMonths[0].month
            );
          }
        } else {
          // No future years, use most recent year and month
          const mostRecentYear = sortedYears[0];
          setSelectedYear(
            mostRecentYear.year.toString()
          );
          setDatesYear(mostRecentYear);

          const sortedMonths = [
            ...mostRecentYear.months,
          ].sort(
            (a, b) =>
              Number(b.month) - Number(a.month)
          );
          if (sortedMonths.length > 0) {
            setSelectedMonth(
              sortedMonths[0].month
            );
          }
        }
      }
    }
  }, [
    datesSnapshot,
    selectedYear,
    selectedMonth,
  ]);

  // Load budget data when it changes
  useEffect(() => {
    if (budgetSnapshot?.docs[0]) {
      const data = budgetSnapshot.docs[0].data();
      if (data.budgets) {
        setBudgets(data.budgets);
      }
    }
  }, [budgetSnapshot]);

  // Update data when spending or budget changes
  useEffect(() => {
    // Initialize categoryTotals with all budgeted categories first
    const categoryTotals = budgets.reduce(
      (acc, budget) => {
        acc[budget.categoryName] = {
          name: budget.categoryName,
          spent: 0,
          budget: budget.subCategories.reduce(
            (total, sub) =>
              total + (sub.budget || 0),
            0
          ),
          subCategories:
            budget.subCategories.reduce(
              (subAcc, sub) => {
                subAcc[sub.name] = {
                  spent: 0,
                  budget: sub.budget || 0,
                };
                return subAcc;
              },
              {} as {
                [key: string]: {
                  spent: number;
                  budget: number;
                };
              }
            ),
        };
        return acc;
      },
      {} as { [key: string]: any }
    );

    // Add spending data if available
    if (spendingSnapshot) {
      const extractedSpendings =
        spendingSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as SpendingModel[];

      // Add spending data to existing categories or create new ones
      extractedSpendings.forEach((spending) => {
        if (!categoryTotals[spending.category]) {
          categoryTotals[spending.category] = {
            name: spending.category,
            spent: 0,
            budget: 0,
            subCategories: {},
          };
        }

        // Add to category total
        categoryTotals[spending.category].spent +=
          Number(spending.sum);

        // Initialize subcategory if doesn't exist
        if (
          !categoryTotals[spending.category]
            .subCategories[spending.subCategory]
        ) {
          categoryTotals[
            spending.category
          ].subCategories[spending.subCategory] =
            {
              spent: 0,
              budget: 0,
            };
        }

        // Add to subcategory total
        categoryTotals[
          spending.category
        ].subCategories[
          spending.subCategory
        ].spent += Number(spending.sum);
      });
    }

    // Get total monthly budget and savings goal from budgetSnapshot
    const budgetData =
      budgetSnapshot?.docs[0]?.data();
    const totalMonthlyBudget =
      budgetData?.totalMonthlyBudget || 0;
    const savingsGoal =
      budgetData?.savingsGoal || 0;

    // Calculate total spending and budget
    const totalSpending = Object.values(
      categoryTotals
    ).reduce(
      (sum, category) => sum + category.spent,
      0
    );

    // Calculate actual savings (unused budget + savings goal)
    const unusedBudget = Math.max(
      0,
      totalMonthlyBudget - totalSpending
    );
    const actualSavings = unusedBudget;

    // Convert to chart data format and add savings category
    const chartData = [
      ...Object.values(categoryTotals)
        .filter(
          (category) =>
            // Show categories that either have a budget or have spending
            category.budget > 0 ||
            category.spent > 0
        )
        .map((category) => ({
          name: `${getCategoryEmoji(
            category.name
          )} ${category.name}`,
          הוצאות: category.spent,
          תקציב: category.budget,
          subCategories: Object.entries(
            category.subCategories
          ).map(
            ([name, data]: [string, any]) => ({
              name,
              spent: data.spent,
              budget: data.budget,
            })
          ),
        })),
      // Add savings category
      {
        name: "💰 חיסכון",
        הוצאות: actualSavings,
        תקציב: savingsGoal,
        subCategories: [
          {
            name: "חיסכון מתקציב שלא נוצל",
            spent: unusedBudget,
            budget: 0,
          },
        ],
      },
    ];

    setChartData(chartData);
  }, [spendingSnapshot, budgets, budgetSnapshot]);

  // Update dates when date snapshot changes
  useEffect(() => {
    if (datesSnapshot) {
      datesSnapshot.docs.forEach((doc) => {
        const date = new DatesModel(
          doc.data().uid,
          doc.data().years,
          doc.id
        );
        setDates(date);

        date.years.sort(
          (a: any, b: any) =>
            Number(b.year) - Number(a.year)
        );
        date.years.forEach((year: any) => {
          year.months.sort(
            (a: any, b: any) =>
              Number(b.month) - Number(a.month)
          );
        });
      });
    }
  }, [datesSnapshot]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const newYearData = dates?.years.find(
      (y) => y.year.toString() === year
    );
    setDatesYear(newYearData);

    if (selectedMonth && newYearData) {
      const monthExists = newYearData.months.some(
        (m) => m.month === selectedMonth
      );

      if (monthExists) {
        return; // Keep the same month if it exists
      }

      // Try to find closest future month
      const sortedMonths = [
        ...newYearData.months,
      ].sort(
        (a, b) =>
          Number(a.month) - Number(b.month)
      );

      const futureMonths = sortedMonths.filter(
        (m) =>
          Number(m.month) >= Number(selectedMonth)
      );

      if (futureMonths.length > 0) {
        setSelectedMonth(futureMonths[0].month);
      } else {
        // If no future months, use first available month
        setSelectedMonth(sortedMonths[0].month);
      }
    } else if (newYearData) {
      // If no month was selected, select first available month
      const sortedMonths = [
        ...newYearData.months,
      ].sort(
        (a, b) =>
          Number(a.month) - Number(b.month)
      );
      if (sortedMonths.length > 0) {
        setSelectedMonth(sortedMonths[0].month);
      }
    }
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || !payload.length)
      return null;

    const data = payload[0].payload as {
      name: string;
      הוצאות: number;
      תקציב: number;
      subCategories: Array<{
        name: string;
        spent: number;
        budget: number;
      }>;
    };

    const isSavingsCategory =
      data.name.includes("חיסכון");

    return (
      <div className="custom-tooltip">
        <p className="category-header">{label}</p>
        <div style={{ marginTop: "5px" }}>
          {isSavingsCategory ? (
            <>
              <span style={{ color: "#00C49F" }}>
                יעד חיסכון: ₪
                {Number(data.תקציב).toFixed(2)}
              </span>
              <br />
              <span style={{ color: "#0088FE" }}>
                חיסכון בפועל: ₪
                {Number(data.הוצאות).toFixed(2)}
              </span>
            </>
          ) : (
            <>
              {budgets.length > 0 && (
                <span
                  style={{ color: "#00C49F" }}
                >
                  תקציב: ₪
                  {Number(data.תקציב).toFixed(2)}
                </span>
              )}
              <br />
              <span
                style={{
                  color:
                    data.הוצאות > data.תקציב
                      ? "#ff4d4f"
                      : "#0088FE",
                }}
              >
                הוצאות: ₪
                {Number(data.הוצאות).toFixed(2)}
              </span>
              {budgets.length > 0 &&
                data.הוצאות > data.תקציב && (
                  <>
                    <br />
                    <span
                      style={{
                        color: "#ff4d4f",
                        fontWeight: "bold",
                      }}
                    >
                      חריגה: ₪
                      {(
                        data.הוצאות - data.תקציב
                      ).toFixed(2)}
                    </span>
                  </>
                )}
            </>
          )}
        </div>
        {!isSavingsCategory && (
          <div
            style={{
              marginTop: "10px",
              borderTop: "1px solid #eee",
              paddingTop: "10px",
            }}
          >
            <p
              style={{
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              תת-קטגוריות:
            </p>
            {data.subCategories.map((sub) => (
              <div
                key={sub.name}
                className="subcategory"
              >
                <span
                  style={{ fontWeight: "bold" }}
                >
                  {sub.name}
                </span>
                <span
                  style={{
                    color:
                      sub.spent > sub.budget
                        ? "#ff4d4f"
                        : "#0088FE",
                  }}
                >
                  הוצאות: ₪
                  {Number(sub.spent).toFixed(2)}
                </span>
                {budgets.length > 0 && (
                  <>
                    <span
                      style={{ color: "#00C49F" }}
                    >
                      תקציב: ₪
                      {Number(sub.budget).toFixed(
                        2
                      )}
                    </span>
                    {sub.spent > sub.budget && (
                      <span
                        style={{
                          color: "#ff4d4f",
                          fontWeight: "bold",
                        }}
                      >
                        חריגה: ₪
                        {(
                          sub.spent - sub.budget
                        ).toFixed(2)}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="BudgetGraph">
      <div className="filters-section">
        <div className="filter-group">
          <div
            className="filter-month"
            style={{
              flexDirection: "row-reverse",
            }}
          >
            <div className="input-group">
              <select
                className="input"
                value={selectedMonth || ""}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
              >
                <option value="" disabled>
                  בחר חודש
                </option>
                {datesSnapshot?.docs.length ===
                0 ? (
                  <option value="loading">
                    טוען...
                  </option>
                ) : (
                  datesYear?.months.map(
                    (month) => (
                      <option
                        key={month.month}
                        value={month.month}
                      >
                        {month.display}
                      </option>
                    )
                  )
                )}
              </select>
              <label className="label">
                חודש
              </label>
            </div>
            <div className="input-group">
              <select
                className="input"
                value={selectedYear || ""}
                onChange={(e) =>
                  handleYearChange(e.target.value)
                }
              >
                <option value="" disabled>
                  בחר שנה
                </option>
                {datesSnapshot?.docs.length ===
                0 ? (
                  <option value="loading">
                    טוען...
                  </option>
                ) : (
                  dates?.years.map((year) => (
                    <option
                      key={year.year}
                      value={year.year}
                    >
                      {year.year}
                    </option>
                  ))
                )}
              </select>
              <label className="label">שנה</label>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h2 className="chart-title">
          {budgets.length > 0
            ? "התפלגות הוצאות מול תקציב"
            : "התפלגות הוצאות לפי קטגוריות"}
        </h2>
        {budgets.length > 0 && (
          <div className="total-summary">
            <div className="total-amount">
              סה"כ הוצאות: ₪
              {chartData
                .filter(
                  (item) =>
                    !item.name.includes("חיסכון")
                )
                .reduce(
                  (sum, item) =>
                    sum + Number(item.הוצאות),
                  0
                )
                .toFixed(2)}
              {" מתוך "}₪
              {budgetSnapshot?.docs[0]
                ?.data()
                ?.totalMonthlyBudget?.toFixed(
                  2
                ) || "0.00"}
            </div>
          </div>
        )}
        {spendingSnapshot?.docs.length === 0 ? (
          <div className="loading-container">
            <LoadingOutlined
              style={{ fontSize: 24 }}
            />
          </div>
        ) : chartData.length === 0 ? (
          <div className="empty-state">
            <h2>אין נתונים להצגה</h2>
          </div>
        ) : (
          <>
            <div
              className="chart-wrapper"
              style={{ height: "500px" }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right:
                      window.innerWidth <= 768
                        ? 20
                        : 80,
                    left:
                      window.innerWidth <= 768
                        ? 5
                        : 80,
                    bottom:
                      window.innerWidth <= 768
                        ? 20
                        : 100,
                  }}
                  barGap={
                    window.innerWidth <= 768
                      ? 2
                      : 8
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="category"
                    dataKey="name"
                    height={
                      window.innerWidth <= 768
                        ? 50
                        : 10
                    }
                    width={
                      window.innerWidth <= 768
                        ? 160
                        : 80
                    }
                    tickFormatter={(value) =>
                      value
                        .split(" ")
                        .slice(1)
                        .join(" ")
                    }
                    interval={0}
                    tick={(props) => {
                      const { x, y, payload } =
                        props;
                      const category =
                        chartData.find(
                          (item) =>
                            item.name ===
                            payload.value
                        );
                      return (
                        <g
                          transform={`translate(${x},${y})`}
                        >
                          <text
                            x={0}
                            y={
                              window.innerWidth <=
                              768
                                ? 15
                                : 20
                            }
                            textAnchor="middle"
                            fill="#666"
                            fontSize={
                              window.innerWidth <=
                              768
                                ? "9"
                                : "12"
                            }
                            transform={
                              window.innerWidth <=
                              768
                                ? "rotate(-45)"
                                : ""
                            }
                          >
                            {payload.value
                              .split(" ")
                              .slice(1)
                              .join(" ")}
                          </text>
                          {budgets.length > 0 &&
                            category && (
                              <text
                                x={
                                  window.innerWidth <=
                                  768
                                    ? -15
                                    : 0
                                }
                                y={
                                  window.innerWidth <=
                                  768
                                    ? 55
                                    : 40
                                }
                                textAnchor={
                                  window.innerWidth <=
                                  768
                                    ? "end"
                                    : "middle"
                                }
                                fill={
                                  !category.name.includes(
                                    "חיסכון"
                                  ) &&
                                  category.הוצאות >
                                    category.תקציב
                                    ? "#ff4d4f"
                                    : "#666"
                                }
                                fontSize={
                                  window.innerWidth <=
                                  768
                                    ? "8"
                                    : "12"
                                }
                              >
                                ₪
                                {Number(
                                  category.הוצאות
                                ).toFixed(0)}{" "}
                                / ₪
                                {Number(
                                  category.תקציב
                                ).toFixed(0)}
                              </text>
                            )}
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    type="number"
                    unit="₪"
                    width={
                      window.innerWidth <= 768
                        ? 40
                        : 80
                    }
                    fontSize={
                      window.innerWidth <= 768
                        ? 8
                        : 12
                    }
                    tickFormatter={(value) =>
                      window.innerWidth <= 768
                        ? value.toString()
                        : `₪${value}`
                    }
                  />
                  <Tooltip
                    content={CustomTooltip}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{
                      fontSize:
                        window.innerWidth <= 768
                          ? "10px"
                          : "12px",
                      paddingTop:
                        window.innerWidth <= 768
                          ? "20px"
                          : "0",
                    }}
                    formatter={(
                      value,
                      entry: any
                    ) => {
                      const isSavings =
                        entry.payload &&
                        entry.payload.name &&
                        entry.payload.name.includes(
                          "חיסכון"
                        );
                      const isOverBudget =
                        entry.payload &&
                        entry.payload.הוצאות >
                          entry.payload.תקציב;
                      return (
                        <span
                          style={{
                            color:
                              value ===
                                "הוצאות" &&
                              !isSavings &&
                              isOverBudget
                                ? "#ff4d4f"
                                : undefined,
                          }}
                        >
                          {value}
                        </span>
                      );
                    }}
                  />
                  {budgets.length > 0 && (
                    <Bar
                      dataKey="תקציב"
                      fill="#00C49F"
                      name="תקציב"
                      barSize={
                        window.innerWidth <= 768
                          ? 20
                          : 30
                      }
                      label={false}
                    />
                  )}
                  <Bar
                    dataKey="הוצאות"
                    name="הוצאות"
                    barSize={
                      window.innerWidth <= 768
                        ? 20
                        : 30
                    }
                    fill="#0088FE"
                    label={false}
                  >
                    {chartData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            budgets.length > 0 &&
                            !entry.name.includes(
                              "חיסכון"
                            ) &&
                            entry.הוצאות >
                              entry.תקציב
                              ? "#ff4d4f"
                              : "#0088FE"
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BudgetGraph;
