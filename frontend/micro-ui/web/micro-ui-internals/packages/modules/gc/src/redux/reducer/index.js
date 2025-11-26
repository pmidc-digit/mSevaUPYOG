import { combineReducers } from "redux";
import GCNewApplicationFormReducer from "./GCNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    GCNewApplicationFormReducer,
  });

export default getRootReducer;
