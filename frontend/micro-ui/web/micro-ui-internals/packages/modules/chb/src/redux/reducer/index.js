import { combineReducers } from "redux";
import CHBApplicationFormReducer from "./CHBApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    CHBApplicationFormReducer,
  });

export default getRootReducer;
