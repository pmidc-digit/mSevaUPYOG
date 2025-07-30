import { combineReducers } from "redux";
import ADSNewApplicationFormReducer from "./ADSNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    ADSNewApplicationFormReducer,
  });

export default getRootReducer;
