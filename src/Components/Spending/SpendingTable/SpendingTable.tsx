import "./SpendingTable.css";
import "../../../Styles/SharedModals.css";
import {
  useEffect,
  useState,
  useMemo,
} from "react";
import { Modal, Space, Table } from "antd";
import type { TableProps } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import dayjs from "dayjs";
import { getCategoryEmoji } from "../../../Utils/CategoryUtils";
import { authStore } from "../../../Redux/AuthState";
import spendingsService from "../../../Services/SpendingsService";

// Components
import { AddSpending } from "../AddSpending/AddSpending";
import { AddCategory } from "../../Categories/AddCategory/AddCategory";
import { AddSubCategory } from "../../Categories/AddSubCategory/AddSubCategory";
import { EditSpending } from "../EditSpending/EditSpending";

// Services & Config
import { db } from "../../../../firebase-config";

// Models
import SpendingModel from "../../../Models/SpendingModel";
import DatesModel from "../../../Models/DatesModel";
import YearsModel from "../../../Models/YearsModel";

// Types
interface DataType {
  id: string;
  category: string;
  subCategory: string;
  date: string;
  sum: number;
  note: string;
}

// Add this custom hook after the imports and before the component
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener(
      "resize",
      handleResize
    );
    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  return isMobile;
};

export function SpendingTable(): JSX.Element {
  // State
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
  const [spending, setSpending] =
    useState<SpendingModel>();

  // Modal States
  const [editModalOpen, setEditModalOpen] =
    useState(false);
  const [addModalOpen, setAddModalOpen] =
    useState(false);
  const [
    addCategoryModalOpen,
    setAddCategoryModalOpen,
  ] = useState(false);
  const [
    addSubCategoryModalOpen,
    setAddSubCategoryModalOpen,
  ] = useState(false);

  // New state for expanded row keys
  const [expandedRowKeys, setExpandedRowKeys] =
    useState<string[]>([]);

  // Add this near the other state declarations
  const isMobile = useIsMobile();

  // Firebase Queries
  const spendingQuery = useMemo(() => {
    if (!selectedYear || !selectedMonth) {
      return null;
    }

    return query(
      collection(db, "spendings"),
      where(
        "uid",
        "==",
        authStore.getState().user?.uid
      ),
      where("year", "==", Number(selectedYear)),
      where("month", "==", Number(selectedMonth)),
      orderBy("date", "desc")
    );
  }, [selectedYear, selectedMonth]);

  const datesQuery = useMemo(() => {
    return query(
      collection(db, "dates"),
      where(
        "uid",
        "==",
        authStore.getState().user?.uid
      )
    );
  }, []);

  const [datesSnapshot] =
    useCollection(datesQuery);
  const [spendingSnapshot, loading] =
    useCollection(spendingQuery);

  // Table Columns Configuration
  const columns: TableProps<DataType>["columns"] =
    useMemo(() => {
      const baseColumns: TableProps<DataType>["columns"] =
        [
          {
            title: "תאריך",
            dataIndex: "date",
            key: "date",
            width: isMobile ? "20%" : "15%",
            align: "center",
          },
          {
            title: "קטגוריה",
            dataIndex: "category",
            key: "category",
            width: isMobile ? "20%" : "15%",
            align: "right",
            render: (category: string) => (
              <span>
                {getCategoryEmoji(category)}{" "}
                {category}
              </span>
            ),
          },
          {
            title: "תת-קטגוריה",
            dataIndex: "subCategory",
            key: "subCategory",
            width: isMobile ? "20%" : "15%",
            align: "right",
          },
          {
            title: "סכום",
            key: "sum",
            dataIndex: "sum",
            width: isMobile ? "40%" : "15%",
            align: "center",
            className: "sum-column",
            render: (sum: number) =>
              `${Number(sum).toFixed(2)} ₪`,
          },
        ];

      if (!isMobile) {
        baseColumns.push(
          {
            title: "הערה",
            key: "note",
            dataIndex: "note",
            width: "25%",
            align: "right",
          },
          {
            title: "פעולות",
            key: "action",
            width: "15%",
            align: "center",
            render: (
              _: any,
              record: DataType
            ) => (
              <Space className="action-buttons">
                <EditOutlined
                  className="action-icon edit"
                  onClick={() =>
                    handleEdit(record)
                  }
                />
                <DeleteOutlined
                  className="action-icon delete"
                  onClick={() => {
                    handleDelete(record);
                  }}
                />
              </Space>
            ),
          }
        );
      }

      return baseColumns;
    }, [isMobile]);

  // Effects
  useEffect(() => {
    if (spendingSnapshot) {
      const extractedSpendings =
        spendingSnapshot.docs.map((doc) => {
          return new SpendingModel(
            doc.data().uid,
            doc.data().category,
            doc.data().subCategory,
            dayjs
              .unix(doc.data().date.seconds)
              .format("DD.MM.YYYY"),
            doc.data().sum,
            doc.data().note,
            doc.id
          );
        });
      setSpendings(extractedSpendings);
    }
  }, [spendingSnapshot]);

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

    // Only set default year and month if they haven't been set yet
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

  // Handlers
  const handleYearChange = (value: string) => {
    setSelectedYear(value);

    // Find the year data for the newly selected year
    const newYearData = dates?.years.find(
      (y) => y.year.toString() === value
    );

    setDatesYear(newYearData);

    // If we have a currently selected month, check if it exists in the new year
    if (selectedMonth && newYearData) {
      const monthExists = newYearData.months.some(
        (m) => m.month === selectedMonth
      );

      if (monthExists) {
        // Keep the same month if it exists in the new year
        return;
      }

      // If the current month doesn't exist, select the most recent month
      const sortedMonths = [
        ...newYearData.months,
      ].sort(
        (a, b) =>
          Number(b.month) - Number(a.month)
      );

      if (sortedMonths.length > 0) {
        const mostRecentMonth =
          sortedMonths[0].month;
        setSelectedMonth(mostRecentMonth);
      }
    } else if (newYearData) {
      // If no month was selected, select the most recent month
      const sortedMonths = [
        ...newYearData.months,
      ].sort(
        (a, b) =>
          Number(b.month) - Number(a.month)
      );

      if (sortedMonths.length > 0) {
        const mostRecentMonth =
          sortedMonths[0].month;
        setSelectedMonth(mostRecentMonth);
      }
    }
  };

  const handleDelete = async (
    record: DataType
  ) => {
    try {
      Modal.confirm({
        title:
          "האם אתה בטוח שברצונך למחוק הוצאה זו?",
        content: `${record.category} - ${record.subCategory} - ${record.sum} ₪`,
        okText: "מחק",
        cancelText: "בטל",
        centered: true,
        okButtonProps: {
          danger: true,
          style: {
            fontWeight: 600,
            textShadow: "none",
          },
        },
        width: 400,
        className: "delete-confirmation-modal",
        async onOk() {
          await spendingsService.deleteSpending(
            record.id
          );
          setSpendings((prev) =>
            prev.filter(
              (spending) =>
                spending.id !== record.id
            )
          );
        },
      });
    } catch (error) {
      console.error(
        "Error showing confirmation:",
        error
      );
    }
  };

  const handleEdit = (record: DataType) => {
    setSpending(record as SpendingModel);
    setEditModalOpen(true);
  };

  const handleSpendingAdd = (
    spending: SpendingModel
  ) => {
    if (
      spending.month === selectedMonth &&
      spending.year === selectedYear
    ) {
      setSpendings((prev) => {
        const newSpendings = [...prev, spending];
        return newSpendings.sort((a, b) => {
          if (a.date < b.date) return -1;
          if (a.date > b.date) return 1;
          return 0;
        });
      });
    }
  };

  const handleSpendingEdit = (
    updatedSpending: SpendingModel
  ) => {
    setSpendings((prev) => {
      const newSpendings = prev.map((spending) =>
        spending.id === updatedSpending.id
          ? updatedSpending
          : spending
      );
      return newSpendings.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      });
    });
  };

  return (
    <div className="SpendingTable">
      <div className="table-title">
        <h1>טבלת הוצאות</h1>
        <p>עקוב אחר ההוצאות שלך</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="add-spending">
            <button
              className="modern-button"
              onClick={() =>
                setAddModalOpen(true)
              }
            >
              הוספת הוצאה
            </button>
            <button
              className="modern-button"
              onClick={() =>
                setAddCategoryModalOpen(true)
              }
            >
              הוספת קטגוריה
            </button>
            <button
              className="modern-button"
              onClick={() =>
                setAddSubCategoryModalOpen(true)
              }
            >
              הוספת תת-קטגוריה
            </button>
          </div>

          <div className="filter-month">
            <div className="input-group">
              <select
                value={selectedMonth}
                className="input"
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
              >
                <option value="" disabled>
                  בחר חודש
                </option>
                {datesYear?.months
                  .slice()
                  .sort(
                    (a, b) =>
                      Number(b.month) -
                      Number(a.month)
                  )
                  .map((month) => (
                    <option
                      key={month.month}
                      value={month.month}
                    >
                      {month.display}
                    </option>
                  ))}
              </select>
              <label className="label">
                חודש
              </label>
            </div>
            <div className="input-group">
              <select
                value={selectedYear}
                className="input"
                onChange={(e) =>
                  handleYearChange(e.target.value)
                }
              >
                <option value="" disabled>
                  בחר שנה
                </option>
                {dates?.years
                  .slice()
                  .sort(
                    (a, b) =>
                      Number(b.year) -
                      Number(a.year)
                  )
                  .map((year) => (
                    <option
                      key={year.year}
                      value={year.year}
                    >
                      {year.year}
                    </option>
                  ))}
              </select>
              <label className="label">שנה</label>
            </div>
          </div>
        </div>

        <div className="table-content">
          {selectedMonth && selectedYear ? (
            <Table<DataType>
              loading={loading}
              bordered
              sticky
              expandable={
                isMobile
                  ? {
                      expandedRowRender: (
                        record
                      ) => (
                        <div className="expanded-row">
                          <div className="expanded-item">
                            <strong>
                              תאריך:
                            </strong>{" "}
                            {record.date}
                          </div>
                          <div className="expanded-item">
                            <strong>
                              קטגוריה:
                            </strong>{" "}
                            {record.category}
                          </div>
                          <div className="expanded-item">
                            <strong>
                              תת-קטגוריה:
                            </strong>{" "}
                            {record.subCategory}
                          </div>
                          <div className="expanded-item">
                            <strong>סכום:</strong>{" "}
                            {Number(
                              record.sum
                            ).toFixed(2)}{" "}
                            ₪
                          </div>
                          <div className="expanded-item">
                            <strong>הערה:</strong>{" "}
                            {record.note}
                          </div>
                          <div className="expanded-item">
                            <Space className="action-buttons">
                              <EditOutlined
                                className="action-icon edit"
                                onClick={() =>
                                  handleEdit(
                                    record
                                  )
                                }
                              />
                              <DeleteOutlined
                                className="action-icon delete"
                                onClick={() =>
                                  handleDelete(
                                    record
                                  )
                                }
                              />
                            </Space>
                          </div>
                        </div>
                      ),
                      expandedRowKeys,
                      onExpand: (
                        expanded,
                        record
                      ) => {
                        setExpandedRowKeys(
                          expanded
                            ? [record.id]
                            : []
                        );
                      },
                    }
                  : undefined
              }
              pagination={false}
              footer={() => (
                <div className="table-footer">
                  סה"כ הוצאות:{" "}
                  <span className="total-amount">
                    {spendings
                      .reduce(
                        (sum, spending) =>
                          sum +
                          Number(spending.sum),
                        0
                      )
                      .toFixed(2)}{" "}
                    ₪
                  </span>
                </div>
              )}
              columns={columns}
              dataSource={spendings as DataType[]}
              rowKey={(record) => record.id}
            />
          ) : (
            <div className="empty-state">
              <h2>
                {selectedYear === ""
                  ? "אנא בחר שנה"
                  : "אנא בחר חודש"}
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        title="הוספת הוצאה"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        centered
        footer={null}
        destroyOnClose
        className="modern-modal"
      >
        <AddSpending
          modalStateChanger={setAddModalOpen}
          spendingStateChanger={handleSpendingAdd}
        />
      </Modal>

      <Modal
        title="הוספת קטגוריה"
        open={addCategoryModalOpen}
        onCancel={() =>
          setAddCategoryModalOpen(false)
        }
        centered
        footer={null}
        destroyOnClose
      >
        <AddCategory
          modalStateChanger={
            setAddCategoryModalOpen
          }
        />
      </Modal>

      <Modal
        title="הוספת תת-קטגוריה"
        open={addSubCategoryModalOpen}
        onCancel={() =>
          setAddSubCategoryModalOpen(false)
        }
        centered
        footer={null}
        destroyOnClose
      >
        <AddSubCategory
          modalStateChanger={
            setAddSubCategoryModalOpen
          }
        />
      </Modal>

      <Modal
        title="עריכת הוצאה"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        centered
        footer={null}
        destroyOnClose
        className="modern-modal"
      >
        <EditSpending
          modalStateChanger={setEditModalOpen}
          spendingStateChanger={
            handleSpendingEdit
          }
          spending={spending!}
        />
      </Modal>
    </div>
  );
}
