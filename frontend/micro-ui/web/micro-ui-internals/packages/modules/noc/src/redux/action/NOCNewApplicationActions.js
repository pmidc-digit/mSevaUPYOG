import { UPDATE_NOCNewApplication_FORMType, SET_NOCNewApplication_STEPType, RESET_NOC_NEW_APPLICATION_FORMType } from "./types";

export const UPDATE_NOCNewApplication_FORM = (key, value) => ({
  type: UPDATE_NOCNewApplication_FORMType,
  payload: { key, value },
});

export const SET_NOCNewApplication_STEP = (step) => ({
  type: SET_NOCNewApplication_STEPType,
  payload: step,
});

export const RESET_NOC_NEW_APPLICATION_FORM = () => ({
  type: RESET_NOC_NEW_APPLICATION_FORMType,
});
