import { UPDATE_Challan_Application_FORMType, SET_Challan_Application_STEPType, RESET_Challan__APPLICATION_FORMType } from "./types";

export const UPDATE_ChallanApplication_FORM = (key, value) => ({
  type: UPDATE_Challan_Application_FORMType,
  payload: { key, value },
});

export const SET_ChallanApplication_STEP = (step) => ({
  type: SET_Challan_Application_STEPType,
  payload: step,
});

export const RESET_ChallanAPPLICATION_FORM = () => ({
  type: RESET_Challan__APPLICATION_FORMType,
});
