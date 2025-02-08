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
  sendPasswordResetEmail,
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

  // הרשמת משתמש חדש למערכת
  public async register(
    user: UserModel
  ): Promise<boolean> {
    const register = httpsCallable(
      functions,
      "register"
    );

    let isLoggedIn = false;
    // יצירת משתמש חדש ב-Firebase Auth
    await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    )
      .then(async (userCredentials) => {
        if (!userCredentials.user) {
          throw new Error("שגיאה ביצירת משתמש");
        } else {
          // Send verification email
          await sendEmailVerification(
            userCredentials.user
          );
          user.uid = userCredentials.user.uid;
          await register(user);
          notifyService.success(
            "נשלח אליך מייל לאימות החשבון. אנא אמת את חשבונך לפני ההתחברות."
          );
          isLoggedIn = false; // Don't auto-login after registration
        }
      })
      .catch((error: any) => {
        notifyService.error({
          code: error.code,
          message: error.message,
        });
      });
    return isLoggedIn;
  }

  // התחברות משתמש קיים
  public async login(
    credentials: CredentialsModel
  ): Promise<boolean> {
    let isLoggedIn = false;
    try {
      const userCredentials =
        await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

      if (!userCredentials.user) {
        throw new Error("שגיאה בהתחברות");
      }

      if (!userCredentials.user.emailVerified) {
        throw new Error(
          "auth/email-not-verified"
        );
      }

      await this.handleTokenAndLogin(
        userCredentials.user.uid,
        credentials.email
      );
      isLoggedIn = true;
    } catch (error: any) {
      notifyService.error({
        code: error.code || error.message,
        message: error.message,
      });
      throw error;
    }
    return isLoggedIn;
  }

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

  // Send password reset email
  public async sendPasswordResetEmail(
    email: string
  ): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      notifyService.success(
        "נשלח אליך מייל לאיפוס הסיסמה"
      );
    } catch (error: any) {
      notifyService.error({
        code: error.code,
        message: error.message,
      });
      throw error;
    }
  }

  // Resend verification email
  public async resendVerificationEmail(
    email: string,
    password: string
  ): Promise<void> {
    try {
      const userCredentials =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      if (userCredentials.user) {
        await sendEmailVerification(
          userCredentials.user
        );
        notifyService.success(
          "מייל אימות נשלח בהצלחה"
        );
      }
    } catch (error: any) {
      notifyService.error({
        code: error.code,
        message: error.message,
      });
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
