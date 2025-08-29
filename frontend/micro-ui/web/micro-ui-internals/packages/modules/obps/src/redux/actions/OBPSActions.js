import { UPDATE_OBPS_FORMType, SET_OBPS_STEPType,RESET_OBPS_FORMType } from "./types";

export const UPDATE_OBPS_FORM = (key, value) => ({
  type: UPDATE_OBPS_FORMType,
  payload: { key, value },
});

export const SET_OBPS_STEP = (step) => ({
  type: SET_OBPS_STEPType,
  payload: step,
});

export const RESET_OBPS_FORM = () => ({
  type: RESET_OBPS_FORMType,
});
