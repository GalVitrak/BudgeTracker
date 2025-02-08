import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getFunctions,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    "AIzaSyBhmwLuDcKhg0RYfZlkt72NH6isfTwQOsg",
  authDomain:
    "spendingcheck-7904e.firebaseapp.com",
  projectId: "spendingcheck-7904e",
  storageBucket:
    "spendingcheck-7904e.firebasestorage.app",
  messagingSenderId: "526528373584",
  appId:
    "1:526528373584:web:c75e913ed87e0bd22a0255",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(
    functions,
    "localhost",
    5002
  );
}
