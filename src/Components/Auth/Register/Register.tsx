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
      <div className="register-container">
        <div className="register-form-section">
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
              <button className="modern-button">
                הירשם
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
