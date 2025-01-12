import { useState } from "react";
import CredentialsModel from "../../../Models/CredentialsModel";
import "./Login.css";
import { useForm } from "react-hook-form";
import { Modal } from "antd";
import Register from "../Register/Register";
import authService from "../../../Services/AuthService";
import { useNavigate } from "react-router-dom";

function Login(): JSX.Element {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const { register, handleSubmit } =
    useForm<CredentialsModel>();

  async function send(
    credentials: CredentialsModel
  ) {
    const proceed = await authService.login(
      credentials
    );
    if (proceed) {
      navigate("/home");
    }
  }
  return (
    <div className="Login">
      <form onSubmit={handleSubmit(send)}>
        <div className="input-group">
          <input
            className="input"
            required
            autoComplete="off"
            type="text"
            {...register("email")}
          />
          <label
            className="label"
            htmlFor="email"
          >
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
          <label
            className="label"
            htmlFor="password"
          >
            סיסמה
          </label>
        </div>
        <div className="input-group">
          <button className="input">התחבר</button>
        </div>
        <h4
          className="regInit"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          עדיין לא רשום? לחץ כאן
        </h4>
      </form>
      <Modal
        destroyOnClose
        footer={null}
        centered
        title=""
        open={isModalOpen}
        // onOk={handleOk}
        onCancel={()=>{
          setIsModalOpen(false)
        }}
      >
        <Register />
      </Modal>
    </div>
  );
}

export default Login;
