import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="NotFound">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <div className="emoji-container">
          <span
            className="emoji"
            role="img"
            aria-label="confused face"
          >
            😅
          </span>
        </div>
        <h2 className="error-message">
          אופס! הגעת לשום מקום
        </h2>
        <p className="error-description">
          כנראה שהתבלבלת בדרך... או שאנחנו
          התבלבלנו
          <br />
          בכל מקרה, בוא נחזור למקום בטוח
        </p>
        <button
          className="modern-button home-button"
          onClick={() => navigate("/home")}
        >
          קח אותי הביתה 🏠
        </button>
      </div>
    </div>
  );
}

export default NotFound;
