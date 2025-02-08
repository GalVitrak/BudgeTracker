/**
 * Login Component
 * Handles user authentication and login functionality
 */

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import CredentialsModel from "../../../Models/CredentialsModel";
import Register from "../Register/Register";
import authService from "../../../Services/AuthService";
import notifyService from "../../../Services/NotifyService";
import "./Login.css";

const MAX_LOGIN_ATTEMPTS = 3;

/**
 * Login component that provides user authentication functionality
 * @returns The login form component
 */
function Login(): JSX.Element {
  const navigate = useNavigate();
  const [
    isRegisterModalOpen,
    setIsRegisterModalOpen,
  ] = useState(false);
  const [
    isVerificationModalOpen,
    setIsVerificationModalOpen,
  ] = useState(false);
  const [isLoading, setIsLoading] =
    useState(false);
  const [
    verificationCredentials,
    setVerificationCredentials,
  ] = useState({ email: "", password: "" });
  const [loginAttempts, setLoginAttempts] =
    useState<{ [key: string]: number }>({});

  const { register, handleSubmit, getValues } =
    useForm<CredentialsModel>();

  const incrementLoginAttempts = useCallback(
    (email: string) => {
      setLoginAttempts((prev) => ({
        ...prev,
        [email]: (prev[email] || 0) + 1,
      }));
      return (loginAttempts[email] || 0) + 1;
    },
    [loginAttempts]
  );

  /**
   * Handles the login form submission
   * @param credentials - The user's login credentials
   */
  async function send(
    credentials: CredentialsModel
  ) {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await authService
        .login(credentials)
        .then((proceed: boolean) => {
          if (proceed) {
            setLoginAttempts((prev) => ({
              ...prev,
              [credentials.email]: 0,
            }));
            navigate("/dashboard");
          }
        })
        .catch((error) => {
          if (
            error.message ===
            "auth/email-not-verified"
          ) {
            const attempts =
              incrementLoginAttempts(
                credentials.email
              );
            setVerificationCredentials({
              email: credentials.email,
              password: credentials.password,
            });

            if (attempts >= MAX_LOGIN_ATTEMPTS) {
              Modal.confirm({
                title: "אימות דוא״ל נדרש",
                content:
                  "הגעת למספר המקסימלי של ניסיונות התחברות. האם תרצה לקבל מייל אימות חדש?",
                okText: "שלח מייל אימות",
                cancelText: "סגור",
                onOk: async () => {
                  try {
                    await authService.resendVerificationEmail(
                      credentials.email,
                      credentials.password
                    );
                    setLoginAttempts((prev) => ({
                      ...prev,
                      [credentials.email]: 0,
                    }));
                  } catch (error) {
                    // Error is already handled by the service
                  }
                },
                className: "modern-modal",
              });
            } else {
              setIsVerificationModalOpen(true);
            }
          }
          throw error;
        });
    } finally {
      setIsLoading(false);
    }
  }

  const handleForgotPassword = async () => {
    const email = getValues("email");
    if (!email) {
      notifyService.error({
        message: "יש להזין כתובת דוא״ל",
      });
      return;
    }

    try {
      await authService.sendPasswordResetEmail(
        email
      );
    } catch (error) {
      // Error is already handled by the service
    }
  };

  const handleResendVerification = async () => {
    try {
      await authService.resendVerificationEmail(
        verificationCredentials.email,
        verificationCredentials.password
      );
      setLoginAttempts((prev) => ({
        ...prev,
        [verificationCredentials.email]: 0,
      }));
      setIsVerificationModalOpen(false);
    } catch (error) {
      // Error is already handled by the service
    }
  };

  return (
    <div className="Login">
      <div className="login-container">
        <div className="login-form-section">
          <form onSubmit={handleSubmit(send)}>
            <div className="input-group">
              <input
                className="input"
                required
                autoComplete="off"
                type="email"
                {...register("email")}
              />
              <label className="label">
                דוא"ל
              </label>
            </div>

            <div className="input-group">
              <input
                className="input"
                required
                type="password"
                {...register("password")}
              />
              <label className="label">
                סיסמה
              </label>
            </div>

            <div className="input-group">
              <button
                className="modern-button"
                disabled={isLoading}
              >
                {isLoading ? "מתחבר..." : "התחבר"}
              </button>
            </div>

            <div className="login-links">
              <span
                onClick={handleForgotPassword}
              >
                אופס... שכחתי את הסיסמה
              </span>
              <span
                onClick={() =>
                  setIsRegisterModalOpen(true)
                }
              >
                עדיין לא נרשמת? קדימה!
              </span>
            </div>
          </form>
        </div>

        <div className="login-image-section">
          <div className="login-image-content">
            <h2>ברוכים הבאים</h2>
            <p>התחבר כדי לנהל את ההוצאות שלך</p>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <Modal
        title="הרשמה"
        open={isRegisterModalOpen}
        onCancel={() =>
          setIsRegisterModalOpen(false)
        }
        centered
        footer={null}
        destroyOnClose
        className="modern-modal"
      >
        <Register />
      </Modal>

      {/* Email Verification Modal */}
      <Modal
        title="אימות דוא״ל נדרש"
        open={isVerificationModalOpen}
        onOk={handleResendVerification}
        onCancel={() =>
          setIsVerificationModalOpen(false)
        }
        centered
        okText="שלח שוב"
        cancelText="סגור"
        className="modern-modal"
      >
        <p>
          עליך לאמת את כתובת הדוא״ל שלך לפני
          ההתחברות.
        </p>
        <p>
          לא קיבלת את המייל? לחץ על ״שלח שוב״ כדי
          לקבל מייל אימות חדש.
        </p>
      </Modal>
    </div>
  );
}

export default Login;
