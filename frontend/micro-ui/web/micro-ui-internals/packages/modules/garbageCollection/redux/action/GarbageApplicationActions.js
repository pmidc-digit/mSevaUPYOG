import { UPDATE_Garbage_Application_FORMType, SET_Garbage_Application_STEPType, RESET_Garbage__APPLICATION_FORMType } from "./types";

export const UPDATE_GarbageApplication_FORM = (key, value) => ({
  type: UPDATE_Garbage_Application_FORMType,
  payload: { key, value },
});

export const SET_GarbageApplication_STEP = (step) => ({
  type: SET_Garbage_Application_STEPType,
  payload: step,
});

export const RESET_GarbageAPPLICATION_FORM = () => ({
  type: RESET_Garbage__APPLICATION_FORMType,
});
