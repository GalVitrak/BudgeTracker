/**
 * NotFound Component
 * Displays a 404 error page when a route is not found
 */

import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

/**
 * NotFound component that provides a user-friendly 404 error page
 * @returns The 404 error page component
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
            aria-label="Confused face"
          >
            😕
          </span>
        </div>
        <h2 className="error-message">
          העמוד לא נמצא
        </h2>
        <p className="error-description">
          מצטערים, אך העמוד שחיפשת אינו קיים.
          <br />
          אולי הקישור שגוי או שהעמוד הוסר.
        </p>
        <Button
          type="primary"
          size="large"
          className="home-button"
          onClick={() => navigate("/")}
        >
          חזור לדף הבית
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
