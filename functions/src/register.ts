import * as functions from "firebase-functions/v1";
import { db } from ".";

const register = functions.https.onCall(
  async (data, context) => {
    const uid = data.uid;
    const role = "User";
    await db
      .collection("users")

      .add({
        uid,
        role,
      });
  }
);

export default register;
