import { UPDATE_OBPS_FORMType, SET_OBPS_STEPType, RESET_OBPS_FORMType, UPDATE_OBPS_CoOrdinatesType, UPDATE_OBPS_OwnerPhotosType, UPDATE_OBPS_OwnerIdsType } from "../actions/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
  coordinates:{},
  ownerPhotos:[],
  ownerIds:[]

};

const OBPSFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_OBPS_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_OBPS_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_OBPS_FORMType:
      return initialState;

    case UPDATE_OBPS_CoOrdinatesType:
      return {
        ...state,
        coordinates: {
          ...state.coordinates,
          [action.payload.key]: action.payload.value,
        },
      };

    case UPDATE_OBPS_OwnerPhotosType:
      return {
        ...state,
        ownerPhotos: {
          ...state.ownerPhotos,
          [action.payload.key]: action.payload.value,
        },
      };

    case UPDATE_OBPS_OwnerIdsType:
      return {
        ...state,
        ownerIds: {
          ...state.ownerIds,
          [action.payload.key]: action.payload.value,
        },
      };

    default:
      return state;
  }
};

export default OBPSFormReducer;
