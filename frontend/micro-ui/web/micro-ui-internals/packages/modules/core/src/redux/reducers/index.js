export const commonReducer = (defaultData) => (state, action) => {
  if (typeof state === "undefined") {
    state = defaultData || {};
  }
  
  if (typeof state === "undefined" || state === null) {
     state = {};
  }

  switch (action.type) {
    case "LANGUAGE_SELECT":
      return { ...state, selectedLanguage: action.payload };
    default:
      return state;
  }
};
