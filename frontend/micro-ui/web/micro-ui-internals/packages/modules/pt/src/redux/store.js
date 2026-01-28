import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import getRootReducer from "./reducer";

const middleware = [thunk];
const getStore = (defaultStore) => {
  return createStore(
    getRootReducer(defaultStore),
    compose(applyMiddleware(...middleware))
  );
};
export default getStore;