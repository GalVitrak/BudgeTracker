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

  useEffect(() => {
    setLoading(true);
    spendingsService
      .getSpendings()
      .then((spendings) => {
        setSpendings(spendings);
        setLoading(false);
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
      <div className="table">
        <div className="add-spending">
          <button
            onClick={() => {
              setAddModalOpen(true);
              // a function that adds a spending
            }}
          >
            הוסף הוצאה
            <PlusOutlined />
          </button>

          <button
            onClick={() => {
              setAddCategoryModalOpen(true);
              // a function that adds a category
            }}
          >
            הוסף קטגוריה
            <PlusOutlined />
          </button>

          <button
            onClick={() => {
              setAddSubCategoryModalOpen(true);
              // a function that adds a sub-category
            }}
          >
            הוסף תת-קטגוריה
            <PlusOutlined />
          </button>
        </div>
        <Table<DataType>
          loading={loading}
          style={{ direction: "rtl" }}
          bordered
          sticky
          pagination={{
            position: ["bottomCenter"],
          }}
          footer={() => {
            return (
              <div>
                <span color="blue">
                  סה"כ הוצאות:{" "}
                  {spendings.reduce(
                    (sum, spending) =>
                      sum + Number(spending.sum),
                    0
                  )}
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
        <AddSpending ModalStatus={addModalOpen} />
      </Modal>
    </div>
  );
}
