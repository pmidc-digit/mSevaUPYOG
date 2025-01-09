import { combineReducers } from "redux";
import employeeFormReducer from "./employeeFormReducer";

const getRootReducer = () =>
  combineReducers({
    employeeForm: employeeFormReducer,
  });

export default getRootReducer;
