class UserModel {
  public id?: string;
  public uid: string;
  public email: string;
  public password: string;
  public role?: string;

  public constructor(
    uid: string,
    email: string,
    password: string,
    id?: string,
    role?: string
  ) {
    this.uid = uid;
    this.email = email;
    this.password = password;
    this.id = id;
    this.role = role;
  }

  public static emailVerification = {
    required: {
      value: true,
      message: "חסרה כתובת דוא''ל",
    },
    pattern: {
      value:
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      message: "כתובת דוא''ל אינה תקינה",
    },
  };

  public static passwordVerification = {
    required: {
      value: true,
      message: "חסרה סיסמה",
    },
    minLength: {
      value: 6,
      message: "הסיסמה חייבת להכיל לפחות 6 תווים",
    },
  };
}

export default UserModel;
