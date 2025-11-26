import { UPDATE_GCNewApplication_FORMType, SET_GCNewApplication_STEPType, RESET_GC_NEW_APPLICATION_FORMType } from "./types";

export const UPDATE_GCNewApplication_FORM = (key, value) => ({
  type: UPDATE_GCNewApplication_FORMType,
  payload: { key, value },
});

export const SET_GCNewApplication_STEP = (step) => ({
  type: SET_GCNewApplication_STEPType,
  payload: step,
});

export const RESET_GC_NEW_APPLICATION_FORM = () => ({
  type: RESET_GC_NEW_APPLICATION_FORMType,
});
