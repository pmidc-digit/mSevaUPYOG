import { combineReducers } from "redux";
import GarbageApplicationFormReducer from "./GarbageApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    GarbageApplicationFormReducer,
  });

export default getRootReducer;
