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
  orderBy,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../../../firebase-config";
import { authStore } from "../../../Redux/AuthState";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import SpendingModel from "../../../Models/SpendingModel";
import { AddSpending } from "../../Spending/AddSpending/AddSpending";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getCategoryEmoji } from "../../../Utils/CategoryUtils";
// import notifyService from "../../../Services/NotifyService";

function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [newSpending, setNewSpending] =
    useState<SpendingModel | null>(null);

  const uid = authStore.getState().user?.uid;

  // Fix date handling to ensure correct current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // Keep as number for Firestore query

  const spendingsRef = collection(
    db,
    "spendings"
  );

  const spendingQuery = useMemo(() => {
    if (!uid) return null;

    // Year and month are stored as numbers in Firestore
    const q = query(
      spendingsRef,
      where("uid", "==", uid),
      where("year", "==", currentYear),
      where("month", "==", currentMonth),
      orderBy("date", "desc")
    );
    return q;
  }, [uid, currentYear, currentMonth]);

  const [spendingSnapshot, loading, error] =
    useCollection(spendingQuery);

  const [totalSpending, setTotalSpending] =
    useState<number>(0);
  const [highestSpending, setHighestSpending] =
    useState<number>(0);
  const [lowestSpending, setLowestSpending] =
    useState<number>(0);
  const [recentSpendings, setRecentSpendings] =
    useState<SpendingModel[]>([]);

  useEffect(() => {
    if (error) {
      console.error(
        "Error fetching data:",
        error
      );
      return;
    }

    if (spendingSnapshot) {
      const extractedSpendings =
        spendingSnapshot.docs.map((doc) => {
          const data = doc.data();

          if (!data.date?.seconds) {
            console.warn(
              "Missing date timestamp for doc:",
              doc.id
            );
          }

          return new SpendingModel(
            data.uid,
            data.category,
            data.subCategory,
            data.date?.seconds
              ? dayjs
                  .unix(data.date.seconds)
                  .format("DD.MM.YYYY")
              : dayjs().format("DD.MM.YYYY"),
            Number(data.sum),
            data.note,
            doc.id
          );
        });

      setRecentSpendings(extractedSpendings);

      if (extractedSpendings.length > 0) {
        const total = extractedSpendings.reduce(
          (sum, spending) =>
            sum + Number(spending.sum),
          0
        );
        setTotalSpending(total);

        const spendingSums =
          extractedSpendings.map((s) =>
            Number(s.sum)
          );
        const highest = Math.max(...spendingSums);
        setHighestSpending(highest);

        const lowest = Math.min(...spendingSums);
        setLowestSpending(lowest);
      } else {
        setRecentSpendings([]);
        setTotalSpending(0);
        setHighestSpending(0);
        setLowestSpending(0);
      }
    }
  }, [spendingSnapshot]);

  useEffect(() => {
    if (newSpending) {
      // Only add the new spending if it's for the current month and year
      if (
        Number(newSpending.month) ===
          currentMonth &&
        Number(newSpending.year) === currentYear
      ) {
        setRecentSpendings((prev) => {
          const updated = [
            newSpending,
            ...prev,
          ].slice(0, 5);
          return updated.sort((a, b) => {
            const dateA = new Date(
              a.date
                .split(".")
                .reverse()
                .join("-")
            );
            const dateB = new Date(
              b.date
                .split(".")
                .reverse()
                .join("-")
            );
            return (
              dateB.getTime() - dateA.getTime()
            );
          });
        });
      }
      setNewSpending(null);
    }
  }, [newSpending, currentMonth, currentYear]);

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
                precision={2}
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
                precision={2}
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
                precision={2}
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
                  navigate("/budget-graph")
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
              <button
                className="modern-button"
                onClick={() =>
                  navigate("/budget-settings")
                }
              >
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
          ) : !recentSpendings ||
            recentSpendings.length === 0 ? (
            <div
              key="empty"
              className="activity-item empty-state"
            >
              עדיין לא נוספו הוצאות החודש
            </div>
          ) : (
            recentSpendings
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
                      ₪
                      {Number(
                        spending.sum
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="activity-date">
                    {formatDate(
                      new Date(
                        spending.date
                          .split(".")
                          .reverse()
                          .join("-")
                      )
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
      year: "numeric",
    }).format(date);
  }
}

export default Dashboard;
