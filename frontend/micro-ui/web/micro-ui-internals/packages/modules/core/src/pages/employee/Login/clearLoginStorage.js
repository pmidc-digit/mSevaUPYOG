// Preserve app bootstrap data and language preferences, never user credentials or drafts.
export const clearLoginStorage = (storage) => {
  const keep = new Set(["Digit.initData", "Digit.locale", "locale", "Employee.locale", "Citizen.locale"]);
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
  keys.forEach((key) => {
    if (!keep.has(key) && !key?.startsWith("Digit.Locale.") && !key?.startsWith("Digit.MDMS")) {
      storage.removeItem(key);
    }
  });
};
