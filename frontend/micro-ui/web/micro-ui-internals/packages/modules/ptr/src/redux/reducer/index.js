import { combineReducers } from "redux";
import PTRNewApplicationFormReducer from "./PTRNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    PTRNewApplicationFormReducer,
});

export default getRootReducer;