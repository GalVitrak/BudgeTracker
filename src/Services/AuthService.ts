import UserModel from "../Models/UserModel";
import { httpsCallable } from "firebase/functions";
import {
  functions,
  auth,
} from "../../firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import notifyService from "./NotifyService";
import CredentialsModel from "../Models/CredentialsModel";
import {
  authStore,
  AuthActionType,
} from "../Redux/AuthState";

// שירות לניהול אימות משתמשים
class AuthService {
  // פונקציה מוגנת להשגת טוקן משתמש מהשרת
  private getToken = httpsCallable(
    functions,
    "getToken"
  );

  // פונקציה פרטית לטיפול בטוקן והתחברות
  private async handleTokenAndLogin(
    uid: string,
    email: string
  ): Promise<void> {
    try {
      const response = await this.getToken({
        uid,
      });
      const token = response.data;

      // שמירת הטוקן ב-Redux
      authStore.dispatch({
        type: AuthActionType.Login,
        payload: { token },
      });

      notifyService.success(
        `משתמש ${email} התחבר בהצלחה`
      );
    } catch (error: any) {
      notifyService.error({
        message: "שגיאה בקבלת טוקן משתמש",
      });
      throw error;
    }
  }

  // הרשמת משתמש חדש למערכת
  public async register(
    user: UserModel
  ): Promise<boolean> {
    const register = httpsCallable(
      functions,
      "register"
    );

    try {
      // יצירת משתמש חדש ב-Firebase Auth
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

      if (!userCredential.user) {
        throw new Error("שגיאה ביצירת משתמש");
      }

      // הגדרת מזהה המשתמש
      user.id = userCredential.user.uid;

      // רישום המשתמש בשרת
      await register(user);

      // שליחת אימות מייל
      await sendEmailVerification(
        userCredential.user
      );

      // טיפול בטוקן והתחברות
      await this.handleTokenAndLogin(
        userCredential.user.uid,
        user.email
      );

      return true;
    } catch (error: any) {
      notifyService.error(error.message);
      return false;
    }
  }

  // התחברות משתמש קיים
  public async login(
    credentials: CredentialsModel
  ): Promise<boolean> {
    try {
      // התחברות באמצעות Firebase Auth
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

      if (!userCredential.user) {
        throw new Error("שגיאה בהתחברות");
      }

      // טיפול בטוקן והתחברות
      await this.handleTokenAndLogin(
        userCredential.user.uid,
        credentials.email
      );

      return true;
    } catch (error: any) {
      notifyService.error({
        code: error.code,
        message: error.message,
      });
      return false;
    }
  }
}

const authService = new AuthService();

export default authService;
