// import { useQuery, useQueryClient } from "react-query";

// const TOKEN_KEY = "bathinda_token";
// const EXPIRY_KEY = "bathinda_token_expiry";

// // --------------------- TOKEN UTILITIES ---------------------

// const getStoredToken = () => {
//   const token = sessionStorage.getItem(TOKEN_KEY);
//   const expiry = sessionStorage.getItem(EXPIRY_KEY);

//   if (!token || !expiry) return null;

//   const isExpired = Date.now() > Number(expiry);

//   if (isExpired) {
//     sessionStorage.removeItem(TOKEN_KEY);
//     sessionStorage.removeItem(EXPIRY_KEY);
//     return null;
//   }

//   return token;
// };

// const storeToken = (token, expiryTime) => {
//   sessionStorage.setItem(TOKEN_KEY, token);
//   sessionStorage.setItem(EXPIRY_KEY, String(expiryTime));
// };

// const fetchToken = async () => {
//   try {
//     const res = await Digit.PTService.authenticateBathinda({
//       UserName: "mcbti",
//       Password: "mcbti@"
//     });

//     const token = res?.data?.Token;
//     const expiration = res?.data?.Expiration;

//     if (!token || !expiration) {
//       throw new Error("Token/expiration missing from authenticate API");
//     }

//     const expiryTime = new Date(expiration).getTime();
//     storeToken(token, expiryTime);

//     return token;
//   } catch (err) {
//     console.error("Token fetch failed:", err);
//     throw new Error("Unable to authenticate Bathinda API");
//   }
// };

// const getValidToken = async () => {
//   const existing = getStoredToken();
//   if (existing) return existing;

//   // Fetch new token if not found or expired
//   return await fetchToken();
// };

// // --------------------- MAIN HOOK ---------------------

// const useBathindaPropertySearch = ({ filters }, config = {}) => {
//   const client = useQueryClient();

//   const queryFn = async () => {
//     let token = await getValidToken();

//     try {
//       // Try API call with existing/new token
//       return await Digit.PTService.getPropertyDetails({ data: filters, token });

//     } catch (error) {
//       // ------------------- Handle 401 Sneakily -------------------
//       if (error?.response?.status === 401) {
//         console.warn("Property API got 401, refreshing token...");

//         // Clear existing token
//         sessionStorage.removeItem(TOKEN_KEY);
//         sessionStorage.removeItem(EXPIRY_KEY);

//         // Fetch new token
//         token = await fetchToken();

//         // Retry once
//         return await Digit.PTService.getPropertyDetails({ data: filters, token });
//       }

//       // Propagate all other errors
//       throw error;
//     }
//   };

//   const query = useQuery(
//     ["propertySearchList", filters],
//     queryFn,
//     {
//       retry: 1, // avoid infinite retry storms
//       ...config,
//     }
//   );

//   const revalidate = () =>
//     client.invalidateQueries(["propertySearchList", filters]);

//   return { ...query, revalidate };
// };

// export default useBathindaPropertySearch;

import { useQuery, useQueryClient } from "react-query";

// --------------------- CONSTANTS ---------------------
const TOKEN_KEY = "bathinda_token";
const EXPIRY_KEY = "bathinda_token_expiry";

// Promise lock to avoid multiple parallel authentication calls
let tokenPromise = null;

// --------------------- TOKEN UTILITIES ---------------------

const getStoredToken = () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = sessionStorage.getItem(EXPIRY_KEY);

  if (!token || !expiry) return null;

  const isExpired = Date.now() > Number(expiry);

  if (isExpired) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    return null;
  }

  return token;
};

const storeToken = (token, expiryTime) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EXPIRY_KEY, String(expiryTime));
};

const fetchToken = async () => {
  try {
    const res = await Digit.PTService.authenticateBathinda({
      UserName: "mcbti",
      Password: "mcbti@"
    });

    const token = res?.data?.Token;
    const expiration = res?.data?.Expiration;

    if (!token || !expiration) {
      throw new Error("Token or expiration missing from authenticate API");
    }

    const expiryTime = new Date(expiration).getTime();
    storeToken(token, expiryTime);

    return token;
  } catch (err) {
    console.error("Token fetch failed:", err);
    throw err;
  }
};

const getValidToken = async () => {
  const existing = getStoredToken();
  if (existing) return existing;

  // Already fetching token? Wait for it
  if (tokenPromise) return tokenPromise;

  // Otherwise, start new token request
  tokenPromise = fetchToken();

  try {
    const token = await tokenPromise;
    return token;
  } finally {
    tokenPromise = null; // reset lock
  }
};

// --------------------- MAIN HOOK ---------------------

const useBathindaPropertySearch = ({ filters }, config = {}) => {
  const client = useQueryClient();

  const queryFn = async () => {
    // Wait for valid/available token
    let token = await getValidToken();

    try {
      return await Digit.PTService.getPropertyDetails({ data: filters, token });

    } catch (error) {
      // Handle unauthorized condition
      if (error?.response?.status === 401) {
        console.warn("Property API returned 401, refreshing token...");

        // Clear old token
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(EXPIRY_KEY);

        // Fetch new token (waits due to lock)
        token = await getValidToken();

        // Retry once
        return await Digit.PTService.getPropertyDetails({ data: filters, token });
      }

      throw error;
    }
  };

  const query = useQuery(
    ["propertySearchList", filters],
    queryFn,
    {
      retry: 1, // prevent infinite loop cycles
      ...config,
    }
  );

  const revalidate = () =>
    client.invalidateQueries(["propertySearchList", filters]);

  return { ...query, revalidate };
};

export default useBathindaPropertySearch;