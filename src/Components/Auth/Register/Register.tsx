import { useNavigate } from "react-router-dom";
import UserModel from "../../../Models/UserModel";
import authService from "../../../Services/AuthService";
import "./Register.css";
import { useForm } from "react-hook-form";

function Register(): JSX.Element {
  const navigate = useNavigate();
  const { register, handleSubmit } =
    useForm<UserModel>();

  async function send(user: UserModel) {
    const proceed = await authService.register(
      user
    );
    if (proceed) {
      navigate("/home");
    }
  }

  return (
    <div className="Register">
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
            autoComplete="off"
            type="text"
            {...register("nickname")}
          />
          <label
            className="label"
            htmlFor="nickname"
          >
            שם
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
          <button className="input">הירשם</button>
        </div>{" "}
      </form>
    </div>
  );
}

export default Register;
