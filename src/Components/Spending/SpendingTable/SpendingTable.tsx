import "./SpendingTable.css";
import { useEffect, useState } from "react";
import { Modal, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import spendingsService from "../../../Services/SpendingsService";
import SpendingModel from "../../../Models/SpendingModel";
import notifyService from "../../../Services/NotifyService";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { AddSpending } from "../AddSpending/AddSpending";
import { collection } from "firebase/firestore";
import { db } from "../../../../firebase-config";
import { AddCategory } from "../AddCategory/AddCategory";
import CategoryModel from "../../../Models/CategoryModel";
import { AddSubCategory } from "../AddSubCategory/AddSubCategory";

export function SpendingTable(): JSX.Element {
  const [loading, setLoading] = useState(false);
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

  // const spendingRef = collection(db, "spendings");

  useEffect(() => {
    setLoading(true);
    spendingsService
      .getSpendings()
      .then((spendings) => {
        setSpendings(spendings);
        setLoading(false);
        if (spendings.length === 0) {
          notifyService.info("לא נמצאו הוצאות");
        }
      })
      .catch((error) => {
        notifyService.error(error);
      });
  }, []);

  interface DataType {
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
            <select className="input" name="year">
              <option defaultChecked value="">
                בחר שנה
              </option>
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
              className="input"
              name="month"
            >
              <option defaultChecked value="">
                בחר חודש
              </option>
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
                <span color="blue">
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
                </span>
              </div>
            );
          }}
          scroll={{ x: 1300 }}
          columns={columns}
          dataSource={spendings}
        />
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
