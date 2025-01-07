import { message } from "antd";

class UserModel {
  public id?: string;
  public nickname: string;
  public email: string;
  public password: string;
  public approved: boolean;
  public averageEarning?: number;
  public averageSpending?: number;
  public role?: string;

  public constructor(
    nickname: string,
    email: string,
    password: string,
    id?: string,
    role?: string
  ) {
    this.nickname = nickname;
    this.email = email;
    this.password = password;
    this.approved = false;
    this.id = id;
    this.role = role;
  }

  public static emailVerification = {
    required: {
      value: true,
      message: "חסרה כתובת מייל",
    },
    pattern: {
      value:
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      message: "כתובת מייל לא תקינה",
    },
  };
}

export default UserModel;
