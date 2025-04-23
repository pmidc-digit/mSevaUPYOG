import { combineReducers } from "redux";
import TLNewApplicationFormReducer from "./TLNewApplicationFormReducer";

const getRootReducer = () =>
  combineReducers({
    tlNewApplicationForm: TLNewApplicationFormReducer,
});

export default getRootReducer;