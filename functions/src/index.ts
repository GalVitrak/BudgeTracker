import * as admin from "firebase-admin";
import register from "./register";
import login from "./login";
import getSpendings from "./getSpending";
import addSpending from "./addSpending";
import getCategories from "./getCategories";
import addCategory from "./addCategory";
import addSubCategory from "./addSubCategory";

admin.initializeApp();

export const db = admin.firestore();

exports.register = register;
exports.login = login;
exports.getSpendings = getSpendings;
exports.addSpending = addSpending;
exports.getCategories = getCategories;
exports.addCategory = addCategory;
exports.addSubCategory = addSubCategory;
