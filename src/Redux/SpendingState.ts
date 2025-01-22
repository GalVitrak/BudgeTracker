/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore } from "redux";
import SpendingModel from "../Models/SpendingModel";

export class SpendingState {
  public spendings: SpendingModel[] | null = null;
}
export enum SpendingActionType {
  Set = "set",
  Delete = "delete",
}

export interface SpendingAction {
  type: SpendingActionType;
  payload?: any;
}

export function SpendingReducer(
  currentState = new SpendingState(),
  action: SpendingAction
): SpendingState {
  // Duplicate current state:
  const newState = { ...currentState };

  // Perform the needed operation:
  //   let container: { spendings: SpendingModel[] };
  switch (action.type) {
    case SpendingActionType.Set:
      newState.spendings =
        action.payload.spendings;
      break;

    case SpendingActionType.Delete:
      newState.spendings = null;
      break;
  }

  // Return the new state:
  return newState;
}

export const SpendingStore = createStore(
  SpendingReducer
);
