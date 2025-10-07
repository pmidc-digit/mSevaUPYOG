import { combineReducers } from "redux";
import OBPSFormReducer from "./OBPSFormReducer";

const getRootReducer = () =>
  combineReducers({
    OBPSFormReducer,
  });

export default getRootReducer;
