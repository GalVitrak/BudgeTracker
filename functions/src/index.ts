import * as admin from "firebase-admin";
import register from "./register";
import addSpending from "./addSpending";
import addCategory from "./addCategory";
import addSubCategory from "./addSubCategory";
import deleteSpending from "./deleteSpending";
import getToken from "./getToken";
import setBudget from "./setBudget";
import updateSpending from "./updateSpending";
import updateCategory from "./updateCategory";
import deleteCategory from "./deleteCategory";
import deleteSubCategory from "./deleteSubCategory";

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
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.deleteSubCategory = deleteSubCategory;
