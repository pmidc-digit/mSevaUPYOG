import { combineReducers } from "redux";
import OBPSFormReducer from "./OBPSFormReducer";
import LayoutNewApplicationFormReducer from "./LayoutNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    OBPSFormReducer,
    LayoutNewApplicationFormReducer
  });

export default getRootReducer;
