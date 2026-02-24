import { createStore, compose, applyMiddleware } from "redux";
// import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import getRootReducer from "./reducers";

const middleware = [thunk];
const getStore = (defaultStore) => {
  return createStore(
    getRootReducer(defaultStore),
    // composeWithDevTools(applyMiddleware(...middleware)) // :
    compose(applyMiddleware(...middleware))
  );
};
export default getStore;


// import { createStore, compose, applyMiddleware } from "redux";
// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
// import thunk from "redux-thunk";
// import getRootReducer from "./reducers";

// const persistConfig = {
//   key: 'root',
//   storage,
// };

// const persistedReducer = persistReducer(persistConfig, getRootReducer());

// const middleware = [thunk];
// const getStore = (defaultStore) => {
//   const store = createStore(
//     persistedReducer,
//     compose(applyMiddleware(...middleware))
//   );
//   const persistor = persistStore(store);
//   return { store, persistor };
// };

// export default getStore;