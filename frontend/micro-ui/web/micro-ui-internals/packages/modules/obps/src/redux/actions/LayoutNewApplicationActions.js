import { RESET_LAYOUT_NEW_APPLICATION_FORMType, SET_LayoutNewApplication_STEPType, UPDATE_LayoutNewApplication_CoOrdinatesType, UPDATE_LayoutNewApplication_FORMType } from "./types";

export const UPDATE_LayoutNewApplication_FORM = (key, value) => ({
  type: UPDATE_LayoutNewApplication_FORMType,
  payload: { key, value },
});

export const SET_LayoutNewApplication_STEP = (step) => ({
  type: SET_LayoutNewApplication_STEPType,
  payload: step,
});

export const RESET_LAYOUT_NEW_APPLICATION_FORM = () => ({
  type: RESET_LAYOUT_NEW_APPLICATION_FORMType,
});

export const UPDATE_LayoutNewApplication_CoOrdinates = (key, value) => ({
  type: UPDATE_LayoutNewApplication_CoOrdinatesType,
  payload: { key, value },
});
