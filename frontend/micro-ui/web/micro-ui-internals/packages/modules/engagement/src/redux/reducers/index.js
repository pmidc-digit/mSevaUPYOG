import { combineReducers } from "redux";
import surveyFormReducer from "./surveyFormReducer";

const getRootReducer = () =>
  combineReducers({
    surveyForm: surveyFormReducer,
  });

export default getRootReducer;
