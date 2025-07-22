import { combineReducers } from "redux";
import OBPSNewApplicationFormReducer from "./OBPSNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    obpsNewApplicationForm: OBPSNewApplicationFormReducer,
  });

export default getRootReducer;
