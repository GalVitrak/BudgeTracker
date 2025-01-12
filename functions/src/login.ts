import * as functions from "firebase-functions/v1";
import { db } from ".";
import cyber from "./cyber";

const login = functions.https.onCall(
  async (data, context) => {
    const email = data.email;
    const password = cyber.hash(data.password);
    if (!email || !password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .where("password", "==", password)
      .get();

    let token;
    if (snapshot.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found"
      );
    }
    snapshot.forEach((doc) => {
      const user = {
        docID: doc.id,
        ...(doc.data() as { password?: string }),
      };
      delete user.password;
      token = cyber.getNewToken(user);
    });
    return token;
  }
);

export default login;
