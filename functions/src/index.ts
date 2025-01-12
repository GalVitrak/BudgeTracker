import * as admin from "firebase-admin";
import register from "./register";
import login from "./login";
import getSpendings from "./getSpending";
import addSpending from "./addSpending";
import getCategories from "./getCategories";

admin.initializeApp();

export const db = admin.firestore();

exports.register = register;
exports.login = login;
exports.getSpendings = getSpendings;
exports.addSpending = addSpending;
exports.getCategories = getCategories;
