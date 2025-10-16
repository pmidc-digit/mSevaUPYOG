import { combineReducers } from "redux";
import ChallanApplicationFormReducer from "./ChallanApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    ChallanApplicationFormReducer,
  });

export default getRootReducer;
