import { UPDATE_ADSNewApplication_FORMType, SET_ADSNewApplication_STEPType, RESET_ADS_NEW_APPLICATION_FORMType } from "./types";

export const UPDATE_ADSNewApplication_FORM = (key, value) => ({
  type: UPDATE_ADSNewApplication_FORMType,
  payload: { key, value },
});

export const SET_ADSNewApplication_STEP = (step) => ({
  type: SET_ADSNewApplication_STEPType,
  payload: step,
});

export const RESET_ADS_NEW_APPLICATION_FORM = () => ({
  type: RESET_ADS_NEW_APPLICATION_FORMType,
});
