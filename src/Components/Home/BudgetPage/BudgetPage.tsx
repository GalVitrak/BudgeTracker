import { useEffect, useState } from "react";
import "./BudgetPage.css";
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import SpendingModel from "../../../Models/SpendingModel";
import "../../../Styles/SharedModals.css";

export function BudgetPage(): JSX.Element {
  const [dates, setDates] =
    useState<DatesModel>();
  const [datesYear, setDatesYear] =
    useState<YearsModel>();
  const [selectedMonth, setSelectedMonth] =
    useState<string>("");
  const [selectedYear, setSelectedYear] =
    useState<string>("");
  const [spendings, setSpendings] = useState<
    SpendingModel[]
  >([]);
  const [chartData, setChartData] = useState<
    { type: string; value: number }[]
  >([]);

  // שאילתות Firebase
  const spendingRef = collection(db, "spendings");
  const spendingQuery = query(
    spendingRef,
    where(
      "uid",
      "==",
      authStore.getState().user?.uid
    ),
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

  const datesRef = collection(db, "dates");
  const datesQuery = query(
    datesRef,
    where(
      "uid",
      "==",
      authStore.getState().user?.uid
    )
  );

  const [datesSnapshot, datesLoading] =
    useCollection(datesQuery);
  const [spendingSnapshot, loading] =
    useCollection(spendingQuery);

  // עדכון הנתונים כאשר משתנה החודש או השנה
  useEffect(() => {
    if (spendingSnapshot) {
      const extractedSpendings =
        spendingSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as SpendingModel[];

      setSpendings(extractedSpendings);

      // Process data for chart - group by category and subcategory
      const categoryTotals =
        extractedSpendings.reduce(
          (acc, spending) => {
            // Initialize category if doesn't exist
            if (!acc[spending.category]) {
              acc[spending.category] = {
                total: 0,
                subCategories: {},
              };
            }

            // Add to category total
            acc[spending.category].total +=
              Number(spending.sum);

            // Initialize subcategory if doesn't exist
            if (
              !acc[spending.category]
                .subCategories[
                spending.subCategory
              ]
            ) {
              acc[
                spending.category
              ].subCategories[
                spending.subCategory
              ] = 0;
            }

            // Add to subcategory total
            acc[spending.category].subCategories[
              spending.subCategory
            ] += Number(spending.sum);

            return acc;
          },
          {} as {
            [key: string]: {
              total: number;
              subCategories: {
                [key: string]: number;
              };
            };
          }
        );

      // Convert to chart data format
      const chartData = Object.entries(
        categoryTotals
      ).map(([category, data]) => ({
        type: category,
        value: data.total,
        subCategories: Object.entries(
          data.subCategories
        ).map(([subCategory, value]) => ({
          type: subCategory,
          value: value,
        })),
      }));

      setChartData(chartData);
    }
  }, [spendingSnapshot]);

  // עדכון התאריכים הזמינים
  useEffect(() => {
    if (datesSnapshot) {
      datesSnapshot.docs.forEach((doc) => {
        const date = new DatesModel(
          doc.data().uid,
          doc.data().years,
          doc.id
        );
        setDates(date);

        date.years.sort((a, b) => {
          if (a.year > b.year) {
            return -1;
          } else if (a.year < b.year) {
            return 1;
          } else {
            return 0;
          }
        });

        date.years.forEach((year) => {
          year.months.sort((a, b) => {
            if (a.month > b.month) {
              return -1;
            } else if (a.month < b.month) {
              return 1;
            } else {
              return 0;
            }
          });
        });
      });
    }
  }, [datesSnapshot]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
  ];

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setDatesYear(
      dates?.years.find(
        (y) => y.year.toString() === year
      )
    );
    setSelectedMonth("");
  };

  return (
    <div className="BudgetPage">
      <div className="filters-section">
        <div className="filter-group">
          <div className="filter-month">
            <div className="input-group">
              <select
                value={selectedYear}
                defaultValue={""}
                className="input"
                onChange={(e) =>
                  handleYearChange(e.target.value)
                }
              >
                <option value="" disabled>
                  בחר שנה
                </option>
                {datesLoading ? (
                  <option value="loading">
                    <LoadingOutlined />
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

            <div className="input-group">
              <select
                defaultValue={""}
                value={selectedMonth}
                className="input"
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
              >
                <option value="" disabled>
                  בחר חודש
                </option>
                {datesLoading ? (
                  <option value="loading">
                    <LoadingOutlined />
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
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingOutlined
            style={{ fontSize: 24 }}
          />
        </div>
      ) : selectedMonth && selectedYear ? (
        <div className="chart-container">
          <h2 className="chart-title">
            התפלגות הוצאות לפי קטגוריות
          </h2>
          <div className="chart-wrapper">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    name,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 +
                      innerRadius +
                      (outerRadius - innerRadius);
                    const x =
                      cx +
                      radius *
                        Math.cos(
                          -midAngle * RADIAN
                        );
                    const y =
                      cy +
                      radius *
                        Math.sin(
                          -midAngle * RADIAN
                        );

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#333"
                        textAnchor={
                          x > cx ? "start" : "end"
                        }
                        dominantBaseline="central"
                      >
                        {`${name} (₪${value.toFixed(
                          0
                        )})`}
                      </text>
                    );
                  }}
                >
                  {chartData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload[0])
                      return null;
                    const data =
                      payload[0].payload;
                    return (
                      <div
                        className="custom-tooltip"
                        style={{
                          background: "white",
                          padding: "12px",
                          border:
                            "1px solid #ccc",
                          borderRadius: "8px",
                          boxShadow:
                            "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontWeight: "bold",
                            fontSize: "14px",
                            borderBottom:
                              "1px solid #eee",
                            paddingBottom: "4px",
                          }}
                        >
                          {data.type}
                        </p>
                        <p
                          style={{
                            margin: "4px 0",
                            color: "#1890ff",
                            fontWeight: "bold",
                          }}
                        >
                          סה״כ: ₪
                          {data.value.toFixed(2)}
                        </p>
                        <div
                          style={{
                            marginTop: "8px",
                          }}
                        >
                          {data.subCategories.map(
                            (sub: any) => (
                              <p
                                key={sub.type}
                                style={{
                                  margin: "4px 0",
                                  fontSize:
                                    "13px",
                                  display: "flex",
                                  justifyContent:
                                    "space-between",
                                  gap: "12px",
                                }}
                              >
                                <span>
                                  {sub.type}:
                                </span>
                                <span
                                  style={{
                                    color: "#666",
                                  }}
                                >
                                  ₪
                                  {sub.value.toFixed(
                                    2
                                  )}
                                </span>
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="total-amount">
            סה"כ הוצאות:{" "}
            {spendings
              .reduce(
                (sum, spending) =>
                  sum + Number(spending.sum),
                0
              )
              .toFixed(2)}{" "}
            ₪
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h2>אנא בחר שנה וחודש להצגת הנתונים</h2>
        </div>
      )}
    </div>
  );
}
