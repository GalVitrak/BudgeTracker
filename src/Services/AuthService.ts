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

class AuthService {
  public async register(
    user: UserModel
  ): Promise<boolean> {
    const register = httpsCallable(
      functions,
      "register"
    );

    let uid;

    await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    )
      .then((userCredential) => {
        const user = userCredential.user;
        notifyService.success(
          `משתמש ${user?.email} נוצר בהצלחה`
        );
        if (user) {
          uid = user.uid;
    
          sendEmailVerification(user);
        }
      })
      .catch((error) => {
        notifyService.error(error);
        return false;
      });

    user.id = uid;
    await register(user)
      .then((result) => {
        console.log(
          "🚀 ~ AuthService ~ result:",
          result
        );
      })
      .catch((error) => {
        notifyService.error(error);
        return false;
      });

    return true;
  }

  public async login(
    credentials: CredentialsModel
  ): Promise<boolean> {
    const login = httpsCallable(
      functions,
      "login"
    );

    let token;
    await login(credentials)
      .then((response) => {
        token = response.data;
      })
      .catch((error) => {
        notifyService.error(error);
        throw new Error(error);
      });

    const payload = {
      token: token,
    };

    if (!token) {
      notifyService.error("משתמש לא נמצא");
      return false;
    }

    authStore.dispatch({
      type: AuthActionType.Login,
      payload: payload,
    });

    await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    )
      .then((userCredential) => {
        const user = userCredential.user;
        notifyService.success(
          `משתמש ${user?.email} התחבר בהצלחה`
        );

        if (!auth.currentUser?.emailVerified) {
          notifyService.info(
            "אנא אשר את כתובת הדואר האלקטרוני שלך"
          );
        }
      })
      .catch((error) => {
        notifyService.error(error);
      });

    return true;
  }
}

const authService = new AuthService();

export default authService;
