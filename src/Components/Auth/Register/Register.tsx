/**
 * Register Component
 * Handles new user registration functionality
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import UserModel from "../../../Models/UserModel";
import authService from "../../../Services/AuthService";
import notifyService from "../../../Services/NotifyService";
import "./Register.css";

/**
 * Register component that provides new user registration functionality
 * @returns The registration form component
 */
function Register(): JSX.Element {
  const navigate = useNavigate();
  const { register, handleSubmit } =
    useForm<UserModel>();
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /**
   * Handles the registration form submission
   * @param user - The new user's registration data
   */
  async function send(user: UserModel) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await authService
        .register(user)
        .then((isLoggedIn) => {
          if (isLoggedIn) {
            navigate("/dashboard");
          }
        })
        .catch((error) => {
          notifyService.error(error);
          throw new Error(error);
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="Register">
      <div className="register-container">
        <div className="register-form-section">
          <form onSubmit={handleSubmit(send)}>
            <div className="input-group">
              <input
                className="input"
                required
                autoComplete="off"
                type="email"
                {...register(
                  "email",
                  UserModel.emailVerification
                )}
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
                {...register(
                  "password",
                  UserModel.passwordVerification
                )}
              />
              <label className="label">
                סיסמה
              </label>
            </div>

            <div className="input-group">
              <button
                className="modern-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "נרשם..."
                  : "הירשם"}
              </button>
            </div>
          </form>
        </div>

        <div className="register-image-section">
          <div className="register-image-content">
            <h2>הרשמה</h2>
            <p>
              צור חשבון חדש כדי להתחיל לנהל את
              ההוצאות שלך
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
