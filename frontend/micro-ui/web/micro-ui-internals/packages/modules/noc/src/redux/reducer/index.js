import { combineReducers } from "redux";
import NOCNewApplicationFormReducer from "./NOCNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    NOCNewApplicationFormReducer,
  });

export default getRootReducer;
