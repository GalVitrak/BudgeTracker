import * as functions from "firebase-functions/v1";
import { db } from ".";
import cyber from "./cyber";

const getToken = functions.https.onCall(
  async (data, context) => {
    const uid = data.uid;
    const snapshot = await db
      .collection("users")
      .where("uid", "==", uid)
      .get();

    let token;
    if (snapshot.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found"
      );
    }
    snapshot.forEach((doc) => {
      console.log(doc.data());
      token = cyber.getNewToken(doc.data());
    });
    return token;
  }
);

export default getToken;
