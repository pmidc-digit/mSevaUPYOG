import { combineReducers } from "redux";
import CHBApplicationFormReducer from "./CHBApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    gcApplicationFormReducer: CHBApplicationFormReducer,
  });

export default getRootReducer;
