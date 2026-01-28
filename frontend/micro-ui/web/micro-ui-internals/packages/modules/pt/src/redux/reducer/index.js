import { combineReducers } from "redux";
import PTNewApplicationFormReducer from "./PTNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    PTNewApplicationFormReducer,
  });

export default getRootReducer;
