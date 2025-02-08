/**
 * NotFound Component
 * Displays a fun and friendly 404 error page when a route is not found
 */

import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";
import { authStore } from "../../../Redux/AuthState";

/**
 * NotFound component that provides a humorous 404 error page
 * @returns The 404 error page component with a fun twist
 */
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
            aria-label="Detective face"
          >
            🕵️
          </span>
        </div>
        <h2 className="error-message">
          אופס! נראה שהלכת לאיבוד...
        </h2>
        <p className="error-description">
          הדף שחיפשת החליט לצאת לחופשה 🏖️
          <br />
          אולי הוא מתחבא במקום אחר, או שפשוט
          התעייף מכל הקליקים
        </p>
        <Button
          type="primary"
          size="large"
          className="home-button"
          onClick={() => {
            if (authStore.getState().user) {
              navigate("/dashboard");
            } else {
              navigate("/home");
            }
          }}
        >
          קח אותי הביתה 🏠
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
