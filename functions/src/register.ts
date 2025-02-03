import * as functions from "firebase-functions/v1";
import { db } from ".";

const register = functions.https.onCall(
  async (data, context) => {
    const uid = data.id;
    const role = "User";
    const userRef = await db
      .collection("users")

      .add({
        uid,
        role,
      });

    return userRef.id;
  }
);

export default register;
