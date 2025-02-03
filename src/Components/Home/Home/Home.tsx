import "./Home.css";
import { Button, Row, Col } from "antd";
import { Link } from "react-router-dom";
import {
  PieChartOutlined,
  DollarOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

function Home(): JSX.Element {
  return (
    <div className="Home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>נהל את ההוצאות שלך בקלות</h1>
          <p>
            פלטפורמה חכמה לניהול הוצאות אישיות,
            מעקב אחר תקציב וקבלת תובנות פיננסיות
          </p>
          <Link to="/register">
            <Button
              type="primary"
              size="large"
              className="cta-button"
            >
              התחל עכשיו - חינם
            </Button>
          </Link>
        </div>
      </section>

      <section className="features-section">
        <h2>למה להשתמש באפליקציה שלנו?</h2>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} lg={6}>
            <div className="feature-card">
              <DollarOutlined className="feature-icon" />
              <h3>מעקב הוצאות</h3>
              <p>
                עקוב אחר כל ההוצאות שלך במקום אחד
                עם ממשק משתמש פשוט ונוח
              </p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="feature-card">
              <PieChartOutlined className="feature-icon" />
              <h3>ניתוח חכם</h3>
              <p>
                קבל תובנות מעמיקות על דפוסי
                ההוצאות שלך עם גרפים וניתוחים
              </p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="feature-card">
              <BarChartOutlined className="feature-icon" />
              <h3>ניהול תקציב</h3>
              <p>
                הגדר תקציבים לקטגוריות שונות וקבל
                התראות כשאתה חורג מהם
              </p>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="feature-card">
              <CheckCircleOutlined className="feature-icon" />
              <h3>דוחות תקופתיים</h3>
              <p>
                קבל דוחות חודשיים ושנתיים מפורטים
                על המצב הפיננסי שלך
              </p>
            </div>
          </Col>
        </Row>
      </section>

      <section className="how-it-works">
        <h2>איך זה עובד?</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>הרשמה מהירה</h3>
            <p>צור חשבון חינמי תוך דקה</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>הוסף הוצאות</h3>
            <p>תעד את ההוצאות שלך בקלות</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>קבל תובנות</h3>
            <p>צפה בניתוחים וקבל המלצות</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>מוכן להתחיל לנהל את ההוצאות שלך?</h2>
        <p>
          הצטרף לאלפי משתמשים שכבר מנהלים את
          ההוצאות שלהם בצורה חכמה
        </p>
        <Link to="/login">
          <Button
            type="primary"
            size="large"
            className="cta-button"
          >
            הירשם עכשיו
          </Button>
        </Link>
      </section>
    </div>
  );
}

export default Home;
