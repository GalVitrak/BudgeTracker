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
  const [cashTotal, setCashTotal] =
    useState<number>(0);
  const [creditTotal, setCreditTotal] =
    useState<number>(0);
  const [
    highestCashSpending,
    setHighestCashSpending,
  ] = useState<number>(0);
  const [
    highestCreditSpending,
    setHighestCreditSpending,
  ] = useState<number>(0);
  const [
    highestDaySpending,
    setHighestDaySpending,
  ] = useState<{ date: string; amount: number }>({
    date: "",
    amount: 0,
  });
  const [
    lowestCashSpending,
    setLowestCashSpending,
  ] = useState<number>(0);
  const [
    lowestCreditSpending,
    setLowestCreditSpending,
  ] = useState<number>(0);
  const [
    lowestDaySpending,
    setLowestDaySpending,
  ] = useState<{ date: string; amount: number }>({
    date: "",
    amount: 0,
  });
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
            data.cash || false, // Add the missing cash parameter
            doc.id
          );
        });

      // Only update if there's no new spending being added
      if (!newSpending) {
        setRecentSpendings(extractedSpendings);
      }

      if (extractedSpendings.length > 0) {
        // Calculate totals
        const total = extractedSpendings.reduce(
          (sum, spending) =>
            sum + Number(spending.sum),
          0
        );
        setTotalSpending(total);

        // Calculate cash and credit totals
        const cashSpendings =
          extractedSpendings.filter(
            (s) => s.cash
          );
        const creditSpendings =
          extractedSpendings.filter(
            (s) => !s.cash
          );

        const cashTotal = cashSpendings.reduce(
          (sum, spending) =>
            sum + Number(spending.sum),
          0
        );
        setCashTotal(cashTotal);

        const creditTotal =
          creditSpendings.reduce(
            (sum, spending) =>
              sum + Number(spending.sum),
            0
          );
        setCreditTotal(creditTotal);

        // Calculate highest individual spendings
        if (cashSpendings.length > 0) {
          const cashSums = cashSpendings.map(
            (s) => Number(s.sum)
          );
          setHighestCashSpending(
            Math.max(...cashSums)
          );
          setLowestCashSpending(
            Math.min(...cashSums)
          );
        } else {
          setHighestCashSpending(0);
          setLowestCashSpending(0);
        }

        if (creditSpendings.length > 0) {
          const creditSums = creditSpendings.map(
            (s) => Number(s.sum)
          );
          setHighestCreditSpending(
            Math.max(...creditSums)
          );
          setLowestCreditSpending(
            Math.min(...creditSums)
          );
        } else {
          setHighestCreditSpending(0);
          setLowestCreditSpending(0);
        }

        // Calculate daily totals
        const dailyTotals: {
          [date: string]: number;
        } = {};
        extractedSpendings.forEach((spending) => {
          const date = spending.date;
          dailyTotals[date] =
            (dailyTotals[date] || 0) +
            Number(spending.sum);
        });

        const dailyAmounts = Object.values(
          dailyTotals
        ).filter((amount) => amount > 0);
        const dailyEntries = Object.entries(
          dailyTotals
        ).filter(([_, amount]) => amount > 0);

        if (dailyEntries.length > 0) {
          // Find highest day
          const maxDailyAmount = Math.max(
            ...dailyAmounts
          );
          const highestDayEntry =
            dailyEntries.find(
              ([_, amount]) =>
                amount === maxDailyAmount
            );
          setHighestDaySpending({
            date: highestDayEntry
              ? highestDayEntry[0]
              : "",
            amount: maxDailyAmount,
          });

          // Find lowest day
          const minDailyAmount = Math.min(
            ...dailyAmounts
          );
          const lowestDayEntry =
            dailyEntries.find(
              ([_, amount]) =>
                amount === minDailyAmount
            );
          setLowestDaySpending({
            date: lowestDayEntry
              ? lowestDayEntry[0]
              : "",
            amount: minDailyAmount,
          });
        } else {
          setHighestDaySpending({
            date: "",
            amount: 0,
          });
          setLowestDaySpending({
            date: "",
            amount: 0,
          });
        }
      } else {
        setRecentSpendings([]);
        setTotalSpending(0);
        setCashTotal(0);
        setCreditTotal(0);
        setHighestCashSpending(0);
        setHighestCreditSpending(0);
        setLowestCashSpending(0);
        setLowestCreditSpending(0);
        setHighestDaySpending({
          date: "",
          amount: 0,
        });
        setLowestDaySpending({
          date: "",
          amount: 0,
        });
      }
    }
  }, [spendingSnapshot, error, newSpending]);

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
        {/* Row 1: Total Spending Breakdown */}
        <Row
          gutter={[8, 8]}
          justify="center"
          style={{ marginBottom: "16px" }}
        >
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                <WalletFilled
                  style={{ color: "#8B4513" }}
                />
              </div>
              <Statistic
                title="סה״כ החודש"
                value={
                  loading
                    ? "טוען..."
                    : totalSpending
                }
                valueStyle={{ color: "#6b8cce" }}
                precision={2}
                prefix="₪"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                💵
              </div>
              <Statistic
                title="סה״כ מזומן"
                value={
                  loading ? "טוען..." : cashTotal
                }
                valueStyle={{ color: "#52c41a" }}
                precision={2}
                prefix="₪"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                💳
              </div>
              <Statistic
                title="סה״כ אשראי"
                value={
                  loading
                    ? "טוען..."
                    : creditTotal
                }
                valueStyle={{ color: "#1890ff" }}
                precision={2}
                prefix="₪"
              />
            </Card>
          </Col>
        </Row>

        {/* Row 2: Highest Spending */}
        <Row
          gutter={[8, 8]}
          justify="center"
          style={{ marginBottom: "16px" }}
        >
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                📅
              </div>
              <Statistic
                title={`יום עם הכי הרבה הוצאות${
                  highestDaySpending.date
                    ? ` (${highestDaySpending.date})`
                    : ""
                }`}
                value={
                  loading
                    ? "טוען..."
                    : highestDaySpending.amount
                }
                valueStyle={{ color: "#ff4d4f" }}
                precision={2}
                prefix="₪"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                💵
                <RiseOutlined
                  style={{ color: "#ff4d4f" }}
                />
              </div>
              <Statistic
                title="הוצאה גבוהה במזומן"
                value={
                  loading
                    ? "טוען..."
                    : highestCashSpending
                }
                valueStyle={{ color: "#ff4d4f" }}
                precision={2}
                prefix="₪"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                💳
                <RiseOutlined
                  style={{ color: "#ff4d4f" }}
                />
              </div>
              <Statistic
                title="הוצאה גבוהה באשראי"
                value={
                  loading
                    ? "טוען..."
                    : highestCreditSpending
                }
                valueStyle={{ color: "#ff4d4f" }}
                precision={2}
                prefix="₪"
              />
            </Card>
          </Col>
        </Row>

        {/* Row 3: Lowest Spending */}
        <Row gutter={[8, 8]} justify="center">
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                📅
              </div>
              <Statistic
                title={`יום עם הכי מעט הוצאות${
                  lowestDaySpending.date
                    ? ` (${lowestDaySpending.date})`
                    : ""
                }`}
                value={
                  loading
                    ? "טוען..."
                    : lowestDaySpending.amount ||
                      "אין"
                }
                valueStyle={{ color: "#52c41a" }}
                precision={2}
                prefix={
                  lowestDaySpending.amount > 0
                    ? "₪"
                    : ""
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                💵
                <FallOutlined
                  style={{ color: "#52c41a" }}
                />
              </div>
              <Statistic
                title="הוצאה נמוכה במזומן"
                value={
                  loading
                    ? "טוען..."
                    : lowestCashSpending || "אין"
                }
                valueStyle={{ color: "#52c41a" }}
                precision={2}
                prefix={
                  lowestCashSpending > 0
                    ? "₪"
                    : ""
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card">
              <div className="stat-card-icon">
                💳
                <FallOutlined
                  style={{ color: "#52c41a" }}
                />
              </div>
              <Statistic
                title="הוצאה נמוכה באשראי"
                value={
                  loading
                    ? "טוען..."
                    : lowestCreditSpending ||
                      "אין"
                }
                valueStyle={{ color: "#52c41a" }}
                precision={2}
                prefix={
                  lowestCreditSpending > 0
                    ? "₪"
                    : ""
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
                    <p className="activity-cash">
                      {spending.cash
                        ? "מזומן"
                        : "אשראי"}
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
