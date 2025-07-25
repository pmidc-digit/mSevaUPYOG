import { combineReducers } from "redux";
import newGCApplicationFormReducer from "./newGCApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    newGCApplicationForm: newGCApplicationFormReducer,
  });

export default getRootReducer;
