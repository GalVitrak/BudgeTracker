import "./Dashboard.css";
import {
  Card,
  Row,
  Col,
  Statistic,
  Modal,
} from "antd";
import {
  WalletFilled,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import {
  collection,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../../../../firebase-config";
import { authStore } from "../../../Redux/AuthState";
import { useEffect, useState } from "react";
import SpendingModel from "../../../Models/SpendingModel";
import { AddSpending } from "../../Spending/AddSpending/AddSpending";
import { useNavigate } from "react-router-dom";
import notifyService from "../../../Services/NotifyService";

function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [newSpending, setNewSpending] =
    useState<SpendingModel | null>(null);

  const uid = authStore.getState().user?.uid;

  // בדיקת התחברות והפניה לדף ההתחברות אם המשתמש לא מחובר
  useEffect(() => {
    if (!uid) {
      notifyService.error({
        message: "יש להתחבר למערכת תחילה",
      });
      navigate("/login");
      return;
    }
  }, [uid, navigate]);

  // אם המשתמש לא מחובר, לא נציג את תוכן הדף
  if (!uid) {
    return <div className="Dashboard"></div>;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const spendingsRef = collection(
    db,
    "spendings"
  );
  const q = uid
    ? query(
        spendingsRef,
        where("uid", "==", uid),
        orderBy("date", "desc"),
        limit(5)
      )
    : null;

  const [snapshot, loading, error] =
    useCollectionData(q);
  const spendings = snapshot?.map((spending) => ({
    ...spending,
    sum: Number(spending.sum),
  })) as SpendingModel[];

  const [totalSpending, setTotalSpending] =
    useState<number>(0);
  const [highestSpending, setHighestSpending] =
    useState<number>(0);
  const [lowestSpending, setLowestSpending] =
    useState<number>(0);

  useEffect(() => {
    if (snapshot && snapshot.length > 0) {
      // Calculate total spending
      const total = snapshot.reduce(
        (sum, spending) =>
          sum + Number(spending.sum),
        0
      );
      setTotalSpending(total);

      // Find highest spending
      const highest = Math.max(
        ...snapshot.map((spending) =>
          Number(spending.sum)
        )
      );
      setHighestSpending(highest);

      // Find lowest spending
      const lowest = Math.min(
        ...snapshot.map((spending) =>
          Number(spending.sum)
        )
      );
      setLowestSpending(lowest);
    } else {
      // Reset values if no data
      setTotalSpending(0);
      setHighestSpending(0);
      setLowestSpending(0);
    }
  }, [snapshot]);

  useEffect(() => {
    if (newSpending) {
      // If we have a new spending, add it to the list
      const updatedSpendings = snapshot
        ? [...snapshot, newSpending]
        : [newSpending];
      // The useCollectionData hook will automatically update with the new data
      setNewSpending(null);
    }
  }, [newSpending]);

  return (
    <div className="Dashboard">
      <div className="dashboard-header">
        <h1>לוח בקרה</h1>
        <p>
          ברוך הבא! הנה סיכום ההוצאות שלך החודש
        </p>
      </div>

      <div className="stats-container">
        <Row gutter={[8, 8]} justify="center">
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <Statistic
                title="סה״כ החודש"
                value={
                  loading
                    ? "טוען..."
                    : totalSpending
                }
                valueStyle={{ color: "#6b8cce" }}
                prefix={
                  <>
                    <WalletFilled className="total-icon" />{" "}
                    ₪
                  </>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <Statistic
                title="הוצאה גבוהה ביותר"
                value={
                  loading
                    ? "טוען..."
                    : highestSpending
                }
                valueStyle={{ color: "#ff4d4f" }}
                prefix={
                  <>
                    <RiseOutlined className="highest-icon" />{" "}
                    ₪
                  </>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <Statistic
                title="הוצאה נמוכה ביותר"
                value={
                  loading
                    ? "טוען..."
                    : lowestSpending
                }
                valueStyle={{ color: "#52c41a" }}
                prefix={
                  <>
                    <FallOutlined className="lowest-icon" />{" "}
                    ₪
                  </>
                }
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="quick-actions">
        <h2 className="section-title">
          פעולות מהירות
        </h2>
        <Row gutter={[8, 8]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card className="action-card">
              <h3>הוספת הוצאה</h3>
              <p>הוסף הוצאה חדשה למעקב</p>
              <button
                className="modern-button"
                onClick={() =>
                  setIsModalOpen(true)
                }
              >
                הוסף הוצאה
              </button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="action-card">
              <h3>דוחות וניתוח</h3>
              <p>צפה בניתוח מפורט של ההוצאות</p>
              <button
                className="modern-button"
                onClick={() =>
                  navigate("/budget")
                }
              >
                צפה בדוחות
              </button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="action-card">
              <h3>הגדרת תקציב</h3>
              <p>
                הגדר תקציב חודשי לניהול הוצאות
              </p>
              <button className="modern-button">
                הגדר תקציב
              </button>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="recent-activity">
        <h2 className="section-title">
          הוצאות אחרונות החודש
        </h2>
        <Card className="activity-card">
          {loading ? (
            <div
              key="loading"
              className="activity-item"
            >
              טוען...
            </div>
          ) : !spendings ||
            spendings.length === 0 ? (
            <div
              key="empty"
              className="activity-item empty-state"
            >
              עדיין לא נוספו הוצאות
            </div>
          ) : (
            spendings
              .sort((a, b) => {
                const dateA = (
                  a.date as unknown as Timestamp
                ).toDate();
                const dateB = (
                  b.date as unknown as Timestamp
                ).toDate();
                return (
                  dateB.getTime() -
                  dateA.getTime()
                );
              })
              .slice(0, 3)
              .map((spending) => (
                <div
                  key={
                    spending.id ||
                    `${spending.date}-${spending.sum}-${spending.category}`
                  }
                  className="activity-item"
                >
                  <div className="activity-icon">
                    {getCategoryEmoji(
                      spending.category
                    )}
                  </div>
                  <div className="activity-details">
                    <h4>
                      {spending.category} -{" "}
                      {spending.subCategory}
                    </h4>
                    <p className="activity-note">
                      {spending.note ||
                        "ללא הערה"}
                    </p>
                    <p className="activity-sum">
                      ₪{spending.sum}
                    </p>
                  </div>
                  <div className="activity-date">
                    {formatDate(
                      (
                        spending.date as unknown as Timestamp
                      ).toDate()
                    )}
                  </div>
                </div>
              ))
          )}
        </Card>
      </div>

      <Modal
        destroyOnClose
        footer={null}
        centered
        title="הוספת הוצאה"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      >
        <AddSpending
          modalStateChanger={setIsModalOpen}
          spendingStateChanger={setNewSpending}
        />
      </Modal>
    </div>
  );
}

// Helper function to get emoji based on category
function getCategoryEmoji(
  category: string
): string {
  const emojiMap: { [key: string]: string } = {
    מזון: "🍽️",
    קניות: "🛒",
    תחבורה: "🚗",
    בילויים: "🎉",
    חשבונות: "📄",
    בית: "🏠",
    בריאות: "⚕️",
    חינוך: "📚",
    אחר: "📌",
  };
  return emojiMap[category] || "📌";
}

// Helper function to format date
function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    date.toDateString() === today.toDateString()
  ) {
    return "היום";
  } else if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "אתמול";
  } else {
    return new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "numeric",
    }).format(date);
  }
}

export default Dashboard;
