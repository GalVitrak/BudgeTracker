import * as admin from "firebase-admin";
import register from "./register";
import addSpending from "./addSpending";
import addCategory from "./addCategory";
import addSubCategory from "./addSubCategory";
import deleteSpending from "./deleteSpending";
import getToken from "./getToken";
import setBudget from "./setBudget";
import updateSpending from "./updateSpending";

admin.initializeApp();

export const db = admin.firestore();

exports.register = register;
exports.getToken = getToken;
exports.addSpending = addSpending;
exports.addCategory = addCategory;
exports.addSubCategory = addSubCategory;
exports.deleteSpending = deleteSpending;
exports.setBudget = setBudget;
exports.updateSpending = updateSpending;
