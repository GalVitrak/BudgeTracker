import * as functions from "firebase-functions/v1";
import { db } from ".";
import cyber from "./cyber";

const register = functions.https.onCall(
  async (data, context) => {
    const uid = data.id;
    const email = data.email;
    const nickname = data.nickname;
    const password = cyber.hash(data.password);
    if (!email || !nickname || !password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }
    const role = "User";
    const userRef = await db
      .collection("users")
      .add({
        uid,
        email,
        nickname,
        password,
        role,
      });

    return userRef.id;
  }
);

export default register;
