import { UPDATE_CHBApplication_FORMType, SET_CHBApplication_STEPType, RESET_CHB_APPLICATION_FORMType } from "./types";

export const UPDATE_CHBApplication_FORM = (key, value) => ({
  type: UPDATE_CHBApplication_FORMType,
  payload: { key, value },
});

export const SET_CHBApplication_STEP = (step) => ({
  type: SET_CHBApplication_STEPType,
  payload: step,
});

export const RESET_CHB_APPLICATION_FORM = () => ({
  type: RESET_CHB_APPLICATION_FORMType,
});
