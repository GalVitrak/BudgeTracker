/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import UserModel from "../Models/UserModel";
import notifyService from "../Services/NotifyService";
import { createStore } from "redux";

export class AuthState {
  public token: string | null = null;
  public user: UserModel | null = null;

  public checkIfTokenExpired = (
    token: string
  ) => {
    try {
      const decoded = JSON.parse(
        window.atob(token.split(".")[1])
      );
      const expiry = decoded.exp;

      if (Date.now() < expiry * 1000) {
        return false;
      }
      return true;
    } catch (e) {
      notifyService.error({
        message: "שגיאה באימות הטוקן",
        details: e,
      });
      return null;
    }
  };

  public constructor() {
    this.token = localStorage.getItem(
      "BudgeTrackerToken"
    );

    if (this.token) {
      if (!this.checkIfTokenExpired(this.token)) {
        const container: { user: UserModel } =
          jwtDecode(this.token);
        this.user = container.user;
      } else {
        this.token = null;
        localStorage.removeItem(
          "BudgeTrackerToken"
        );
      }
    }
  }
}

export enum AuthActionType {
  Register = "register",
  Login = "login",
  Logout = "logout",
}

export interface AuthAction {
  type: AuthActionType;
  payload?: any;
}

export function authReducer(
  currentState = new AuthState(),
  action: AuthAction
): AuthState {
  // Duplicate current state:
  const newState = { ...currentState };

  // Perform the needed operation:
  let container: { user: UserModel };
  switch (action.type) {
    case AuthActionType.Register:
      break;

    case AuthActionType.Login:
      newState.token = action.payload.token;
      if (newState.token) {
        container = jwtDecode(newState.token);
        newState.user = container.user;
        localStorage.setItem(
          "BudgeTrackerToken",
          newState.token
        );
      }
      break;

    case AuthActionType.Logout:
      newState.token = null;
      newState.user = null;
      localStorage.removeItem(
        "BudgeTrackerToken"
      );
      break;
  }

  // Return the new state:
  return newState;
}

export const authStore = createStore(authReducer);
