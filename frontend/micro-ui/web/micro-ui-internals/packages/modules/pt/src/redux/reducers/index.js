import { combineReducers } from "redux";
import PTNewApplicationFormReducer from "./PTNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    PTNewApplicationForm: PTNewApplicationFormReducer,
  });

export default getRootReducer;
