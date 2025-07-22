import { combineReducers } from "redux";
import edcrReducer from "./edcrReducer";

const getRootReducer = () =>
  combineReducers({
    edcr: edcrReducer,
  });

export default getRootReducer;
