import * as admin from "firebase-admin";
import register from "./register";
import login from "./login";
import addSpending from "./addSpending";
import addCategory from "./addCategory";
import addSubCategory from "./addSubCategory";

admin.initializeApp();

export const db = admin.firestore();

exports.register = register;
exports.login = login;
exports.addSpending = addSpending;
exports.addCategory = addCategory;
exports.addSubCategory = addSubCategory;
