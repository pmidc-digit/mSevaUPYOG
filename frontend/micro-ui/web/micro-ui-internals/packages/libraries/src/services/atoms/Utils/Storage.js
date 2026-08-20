const localStoreSupport = () => {
  try {
    return "sessionStorage" in window && window["sessionStorage"] !== null;
  } catch (e) {
    return false;
  }
};

const k = (key) => `Digit.${key}`;

const cleanupExpiredEntries = (storageClass) => {
  if (!localStoreSupport()) return;
  try {
    const now = Date.now();
    const keys = [];
    for (let i = 0; i < storageClass.length; i++) {
      keys.push(storageClass.key(i));
    }
    keys.forEach((key) => {
      if (key && key.startsWith("Digit.MDMS")) {
        try {
          const item = JSON.parse(storageClass.getItem(key));
          if (item && item.expiry && now > item.expiry) {
            storageClass.removeItem(key);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
  } catch (e) {
    // Ignore cleanup errors
  }
};

const getStorage = (storageClass) => ({
  get: (key) => {
    if (localStoreSupport() && key) {
      let valueInStorage = storageClass.getItem(k(key));
      if (!valueInStorage || valueInStorage === "undefined") {
        return null;
      }
      const item = JSON.parse(valueInStorage);
      if (Date.now() > item.expiry) {
        storageClass.removeItem(k(key));
        return null;
      }
      return item.value;
    } else if (typeof window !== "undefined") {
      return window?.eGov?.Storage && window.eGov.Storage[k(key)].value;
    } else {
      return null;
    }
  },
  set: (key, value, ttl = 86400) => {
    const item = {
      value,
      ttl,
      expiry: Date.now() + ttl * 1000,
    };
    if (localStoreSupport()) {
      try {
        storageClass.setItem(k(key), JSON.stringify(item));
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          cleanupExpiredEntries(storageClass);
          try {
            storageClass.setItem(k(key), JSON.stringify(item));
          } catch (retryError) {
            console.warn("Storage quota exceeded even after cleanup", retryError);
          }
        } else {
          throw e;
        }
      }
    } else if (typeof window !== "undefined") {
      window.eGov = window.eGov || {};
      window.eGov.Storage = window.eGov.Storage || {};
      window.eGov.Storage[k(key)] = item;
    }
  },
  del: (key) => {
    if (localStoreSupport()) {
      storageClass.removeItem(k(key));
    } else if (typeof window !== "undefined") {
      window.eGov = window.eGov || {};
      window.eGov.Storage = window.eGov.Storage || {};
      delete window.eGov.Storage[k(key)];
    }
  },
  cleanup: () => cleanupExpiredEntries(storageClass),
});

export const Storage = getStorage(window.sessionStorage);
export const PersistantStorage = getStorage(window.localStorage);
