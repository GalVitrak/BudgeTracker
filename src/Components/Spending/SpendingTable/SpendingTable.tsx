import "./SpendingTable.css";
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
  LoadingOutlined,
} from "@ant-design/icons";
import {
  collection,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import dayjs from "dayjs";
import "../../../Styles/SharedModals.css";
import { Modal as AntModal } from "antd";
import notifyService from "../../../Services/NotifyService";

// Components
import { AddSpending } from "../AddSpending/AddSpending";
import { AddCategory } from "../AddCategory/AddCategory";
import { AddSubCategory } from "../AddSubCategory/AddSubCategory";
import { EditSpending } from "../EditSpending/EditSpending";

// Services & Config
import { db } from "../../../../firebase-config";
import { authStore } from "../../../Redux/AuthState";

// Models
import SpendingModel from "../../../Models/SpendingModel";
import DatesModel from "../../../Models/DatesModel";
import YearsModel from "../../../Models/YearsModel";
import spendingsService from "../../../Services/SpendingsService";

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
    return query(
      collection(db, "spendings"),
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

  const [datesSnapshot, datesLoading] =
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
            align: "center",
          },
          {
            title: "תת-קטגוריה",
            dataIndex: "subCategory",
            key: "subCategory",
            width: isMobile ? "20%" : "15%",
            align: "center",
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
            align: "center",
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
                    console.log(record.id);

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
    if (datesSnapshot?.docs[0]) {
      const date = new DatesModel(
        datesSnapshot.docs[0].data().uid,
        datesSnapshot.docs[0].data().years,
        datesSnapshot.docs[0].id
      );
      setDates(date);

      // Sort years and months
      date.years.sort((a, b) => {
        if (a.year > b.year) return -1;
        if (a.year < b.year) return 1;
        return 0;
      });

      date.years.forEach((year) => {
        year.months.sort((a, b) => {
          if (a.month > b.month) return -1;
          if (a.month < b.month) return 1;
          return 0;
        });
      });
    }
  }, [datesSnapshot]);

  // Handlers
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setDatesYear(
      dates?.years.find(
        (y) => y.year.toString() === value
      )
    );
    setSelectedMonth("");
  };

  const handleDelete = async (
    record: DataType
  ) => {
    try {
      AntModal.confirm({
        title:
          "האם אתה בטוח שברצונך למחוק הוצאה זו?",
        content: `${record.category} - ${record.subCategory} - ${record.sum} ₪`,
        okText: "מחק",
        cancelText: "בטל",
        okButtonProps: { danger: true },
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
      if (
        updatedSpending.month === selectedMonth &&
        updatedSpending.year === selectedYear
      ) {
        const newSpendings = prev.map(
          (spending) =>
            spending.id === updatedSpending.id
              ? updatedSpending
              : spending
        );
        return newSpendings.sort((a, b) => {
          if (a.date < b.date) return -1;
          if (a.date > b.date) return 1;
          return 0;
        });
      } else {
        return prev.filter(
          (spending) =>
            spending.id !== updatedSpending.id
        );
      }
    });
  };

  return (
    <div className="SpendingTable">
      <div className="table-header">
        <div className="add-spending">
          <button
            className="modern-button"
            onClick={() => setAddModalOpen(true)}
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
              value={selectedYear}
              className="input"
              onChange={(e) =>
                handleYearChange(e.target.value)
              }
            >
              <option value="" disabled>
                בחר שנה
              </option>
              {dates?.years.map((year) => (
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
              {datesYear?.months.map((month) => (
                <option
                  key={month.month}
                  value={month.month}
                >
                  {month.display}
                </option>
              ))}
            </select>
            <label className="label">חודש</label>
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
                          <strong>תאריך:</strong>{" "}
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
                                handleEdit(record)
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
            pagination={{
              responsive: true,
              position: ["topCenter"],
              hideOnSinglePage: true,
            }}
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
            dataSource={spendings}
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
