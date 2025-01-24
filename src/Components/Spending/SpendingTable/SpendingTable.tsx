import "./SpendingTable.css";
import { useEffect, useState } from "react";
import { Modal, Space, Table } from "antd";
import type { TableProps } from "antd";
import SpendingModel from "../../../Models/SpendingModel";
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { AddSpending } from "../AddSpending/AddSpending";
import {
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import { AddCategory } from "../AddCategory/AddCategory";
import { AddSubCategory } from "../AddSubCategory/AddSubCategory";
import { authStore } from "../../../Redux/AuthState";
import { useCollection } from "react-firebase-hooks/firestore";
import dayjs from "dayjs";
import DatesModel from "../../../Models/DatesModel";
import YearsModel from "../../../Models/YearsModel";

export function SpendingTable(): JSX.Element {
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
  const [spending, setSpending] =
    useState<SpendingModel>();

  const spendingRef = collection(db, "spendings");

  const spendingQuery = query(
    spendingRef,
    where(
      "uid",
      "==",
      authStore.getState().user?.uid
    ),
    where("year", "==", +selectedYear),
    where("month", "==", +selectedMonth)
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

  let extractedSpendings: SpendingModel[] = [];

  useEffect(() => {
    extractedSpendings = [];
    if (extractedSpendings.length === 0) {
      spendingSnapshot?.docs.map((doc) => {
        const spending = new SpendingModel(
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
        extractedSpendings.push(spending);
      });
      setSpendings(extractedSpendings);
    }
  }, [loading, selectedMonth, selectedYear]);

  useEffect(() => {
    datesSnapshot?.docs.map((doc) => {
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
  }, [datesLoading]);

  interface DataType {
    id: string;
    category: string;
    subCategory: string;
    date: string;
    sum: number;
    note: string;
  }

  const columns: TableProps<DataType>["columns"] =
    [
      {
        title: "תאריך",
        dataIndex: "date",
        key: "date",
      },
      {
        title: "קטגוריה",
        dataIndex: "category",
        key: "category",
      },
      {
        title: "תת-קטגוריה",
        dataIndex: "subCategory",
        key: "subCategory",
      },
      {
        title: "סכום",
        key: "sum",
        dataIndex: "sum",
      },
      {
        title: "הערה",
        key: "note",
        dataIndex: "note",
      },
      {
        title: "פעולות",
        key: "action",

        render: (_, record) => (
          <Space
            size={"small"}
            style={{
              direction: "ltr",
              display: "flex",
              justifyContent: "space-evenly",
            }}
          >
            <DeleteOutlined
              style={{ cursor: "pointer" }}
              onClick={() => {
                console.log(record);

                // a function that deletes the spending and removes it from the current array
              }}
            />

            <EditOutlined
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSpending(
                  record as SpendingModel
                );
                // open the edit modal
                setEditModalOpen(true);
              }}
            />
          </Space>
        ),
      },
    ];

  return (
    <div className="SpendingTable">
      <div className="table-header">
        <div className="add-spending">
          <div className="input-group">
            <button
              className="input"
              onClick={() => {
                setAddModalOpen(true);
                // a function that adds a spending
              }}
            >
              הוספת הוצאה
              {/* <PlusOutlined /> */}
            </button>
          </div>

          <div className="input-group">
            <button
              className="input"
              onClick={() => {
                setAddCategoryModalOpen(true);
                // a function that adds a category
              }}
            >
              הוספת קטגוריה
              {/* <PlusOutlined /> */}
            </button>
          </div>
          <div className="input-group">
            <button
              className="input"
              onClick={() => {
                setAddSubCategoryModalOpen(true);
                // a function that adds a sub-category
              }}
            >
              הוספת תת-קטגוריה
              {/* <PlusOutlined /> */}
            </button>
          </div>
        </div>
        <div className="filter-month">
          <div className="input-group">
            <select
              defaultValue={""}
              className="input"
              name="year"
              onChange={(e) => {
                let selectedYear: YearsModel;
                dates?.years.forEach((year) => {
                  if (
                    year.year.toString() ===
                    e.target.value
                  ) {
                    selectedYear = year;
                  }
                  setDatesYear(selectedYear);
                });
                setSelectedYear(e.target.value);
                setSelectedMonth("");
              }}
            >
              <>
                {datesLoading && (
                  <option
                    key={"loading"}
                    value={"loading"}
                  >
                    <LoadingOutlined />
                  </option>
                )}
              </>
              <option value="" disabled>
                בחר שנה
              </option>
              {dates?.years.map((year) => {
                return (
                  <option
                    value={year.year}
                    key={year.year}
                  >
                    {year.year}
                  </option>
                );
              })}
            </select>
            <label
              className="label"
              htmlFor="year"
            >
              שנה
            </label>
          </div>
          <div className="input-group">
            <select
              defaultValue={""}
              className="input"
              name="month"
              onChange={(e) => {
                setSelectedMonth(e.target.value);
              }}
            >
              <>
                {datesLoading && (
                  <option
                    key={"loading"}
                    value={"loading"}
                  >
                    <LoadingOutlined />
                  </option>
                )}
              </>
              <option value="">בחר חודש</option>
              {datesYear?.months.map((month) => (
                <option
                  value={month.month}
                  key={month.month}
                >
                  {month.display}
                </option>
              ))}
            </select>
            <label
              className="label"
              htmlFor="month"
            >
              חודש
            </label>
          </div>
        </div>
      </div>
      <div className="table">
        <>
          {selectedMonth !== "" &&
          selectedYear !== "" ? (
            <Table<DataType>
              loading={loading}
              style={{
                direction: "rtl",
                textAlign: "center",
              }}
              bordered
              sticky
              pagination={{
                responsive: true,
                position: ["topCenter"],
                hideOnSinglePage: true,
                style: { direction: "ltr" },
              }}
              footer={() => {
                return (
                  <div>
                    סה"כ הוצאות:{" "}
                    {spendings
                      .reduce(
                        (sum, spending) =>
                          sum +
                          Number(spending.sum),
                        0
                      )
                      .toFixed(2)}
                    ₪
                  </div>
                );
              }}
              scroll={{ x: 1300 }}
              columns={columns}
              dataSource={spendings}
              rowKey={(record) => record.id}
            />
          ) : (
            <div className="empty-table">
              {selectedYear === "" ? (
                <h1>אנא בחר שנה</h1>
              ) : (
                <h1>אנא בחר חודש</h1>
              )}
            </div>
          )}
        </>
      </div>
      <Modal
        onCancel={() => {
          setAddModalOpen(false);
        }}
        title="הוספת הוצאה"
        open={addModalOpen}
        centered
        footer={null}
        destroyOnClose
      >
        <AddSpending
          modalStateChanger={setAddModalOpen}
          spendingStateChanger={(
            spending: SpendingModel
          ) => {
            if (
              spending.month === selectedMonth ||
              spending.year === selectedYear
            ) {
              const newSpendings = spendings;
              newSpendings.push(spending);
              newSpendings.sort((a, b) => {
                if (a.date < b.date) {
                  return -1;
                } else if (a.date > b.date) {
                  return 1;
                } else {
                  return 0;
                }
              });
              setSpendings(newSpendings);
            }
          }}
        />
      </Modal>

      <Modal
        onCancel={() => {
          setAddCategoryModalOpen(false);
        }}
        title="הוספת קטגוריה"
        open={addCategoryModalOpen}
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
        onCancel={() => {
          setAddSubCategoryModalOpen(false);
        }}
        title="הוספת קטגוריה"
        open={addSubCategoryModalOpen}
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
    </div>
  );
}
