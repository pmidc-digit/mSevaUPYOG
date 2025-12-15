import { combineReducers } from "redux";
import RentAndLeaseNewApplicationFormReducer from "./RentAndLeaseNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    RentAndLeaseNewApplicationFormReducer,
  });

export default getRootReducer;

