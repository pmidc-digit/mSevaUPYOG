// Keep application configuration and language resources; discard stale user data.
export const clearLoginLocalStorage = (storage) => {
  const essentialKeys = new Set(["Digit.initData", "Digit.locale", "locale", "Employee.locale", "Citizen.locale"]);
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
  keys.forEach((key) => {
    if (!essentialKeys.has(key) && !key?.startsWith("Digit.Locale.") && !key?.startsWith("Digit.MDMS")) {
      storage.removeItem(key);
    }
  });
};
