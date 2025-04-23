import { combineReducers } from "redux";
import complaintReducer from "./complaintReducer";

const getRootReducer = () =>
  combineReducers({
    swach: complaintReducer,
  });

export default getRootReducer;
