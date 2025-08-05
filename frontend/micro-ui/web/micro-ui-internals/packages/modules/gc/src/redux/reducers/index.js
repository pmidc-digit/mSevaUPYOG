import { combineReducers } from "redux";
import newWSApplicationFormReducer from "./newWSApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    newWSApplicationForm: newWSApplicationFormReducer,
  });

export default getRootReducer;
