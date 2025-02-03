import { useState } from "react";
import CredentialsModel from "../../../Models/CredentialsModel";
import "./Login.css";
import { useForm } from "react-hook-form";
import { Modal } from "antd";
import Register from "../Register/Register";
import authService from "../../../Services/AuthService";
import { useNavigate } from "react-router-dom";
import notifyService from "../../../Services/NotifyService";

function Login(): JSX.Element {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(false);
  const { register, handleSubmit } =
    useForm<CredentialsModel>();

  async function send(
    credentials: CredentialsModel
  ) {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await authService
        .login(credentials)
        .then(() => {
          navigate("/dashboard");
        })
        .catch((error) => {
          notifyService.error(error);
          throw new Error(error);
        });
    } finally {
      setIsLoading(false);
    }
  }

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
                type="text"
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

            <h4
              className="regInit"
              onClick={() => setIsModalOpen(true)}
            >
              עדיין לא רשום? לחץ כאן
            </h4>
          </form>
        </div>

        <div className="login-image-section">
          <div className="login-image-content">
            <h2>ברוכים הבאים</h2>
            <p>התחבר כדי לנהל את ההוצאות שלך</p>
          </div>
        </div>
      </div>

      <Modal
        destroyOnClose
        footer={null}
        centered
        title=""
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      >
        <Register />
      </Modal>
    </div>
  );
}

export default Login;
