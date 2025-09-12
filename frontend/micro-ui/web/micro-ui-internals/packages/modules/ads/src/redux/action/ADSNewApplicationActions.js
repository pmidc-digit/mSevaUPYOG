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

export const SET_LOCALITY_FILTER = "SET_LOCALITY_FILTER";
export const SET_APPLICATION_TYPE_FILTER = "SET_APPLICATION_TYPE_FILTER";

// export const setLocalityFilter = (locality) => ({
//   type: SET_LOCALITY_FILTER,
//   payload: locality,
// });

// export const setApplicationTypeFilter = (applicationType) => ({
//   type: SET_APPLICATION_TYPE_FILTER,
//   payload: applicationType,
// });
