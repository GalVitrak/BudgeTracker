class UserModel {
  public id?: string;
  public uid: string;
  public email: string;
  public nickname: string;
  public password: string;
  public approved: boolean;
  public averageEarning?: number;
  public averageSpending?: number;
  public role?: string;

  public constructor(
    uid: string,
    email: string,
    nickname: string,
    password: string,
    id?: string,
    role?: string
  ) {
    this.uid = uid;
    this.email = email;
    this.nickname = nickname;
    this.password = password;
    this.approved = false;
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
}

export default UserModel;
