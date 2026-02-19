import { UPDATE_LayoutNewApplication_FORMType, SET_LayoutNewApplication_STEPType, RESET_LAYOUT_NEW_APPLICATION_FORMType, UPDATE_LayoutNewApplication_CoOrdinatesType, UPDATE_LayoutNewApplication_OwnerPhotosType, UPDATE_LayoutNewApplication_OwnerIdsType } from "./types";

export const UPDATE_LayoutNewApplication_FORM = (key, value) => ({
  type: UPDATE_LayoutNewApplication_FORMType,
  payload: { key, value },
});

export const SET_LayoutNewApplication_STEP = (step) => ({
  type: SET_LayoutNewApplication_STEPType,
  payload: step,
});

export const RESET_LayoutNewApplication_FORM = () => ({
  type: RESET_LAYOUT_NEW_APPLICATION_FORMType,
});

export const UPDATE_LayoutNewApplication_CoOrdinates = (key, value) => ({
  type: UPDATE_LayoutNewApplication_CoOrdinatesType,
  payload: { key, value },
});

export const UPDATE_LayoutNewApplication_OwnerPhotos = (key, value) => ({
  type: UPDATE_LayoutNewApplication_OwnerPhotosType,
  payload: { key, value },
});

export const UPDATE_LayoutNewApplication_OwnerIds = (key, value) => ({
  type: UPDATE_LayoutNewApplication_OwnerIdsType,
  payload: { key, value },
});
