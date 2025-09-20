import { useQuery, useQueryClient } from "react-query";

/**
 * fetcher: returns the raw response from the service
 */
const useADSSearch = (params, tenantId, config) => {
  return async () => {
    const res = await Digit.ADSServices.search({ filters: params, tenantId, config });
    console.log("API call parameters:", { filters: params, tenantId, config });
    console.log("Raw API response:", res);
    return res; // return raw response so select can normalize it
  };
};

/**
 * Citizen hook: returns { data: [bookingObj,...], count }
 * Ensures each element in `data` is the booking object itself (with optional helper labels added)
 */
export const useADSSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();
  const key = ["ADS_APPLICATIONS_LIST", JSON.stringify(params)];

  const result = useQuery(key, useADSSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (res) => {
      console.log("select raw res:", res);

      // Try multiple possible paths (based on observed API shapes)
      const root = res ?? {};
      const candidate = root?.bookingApplication ?? root?.bookings ?? root?.Applications ?? root?.data ?? root?.advertisements ?? root;

      // normalize to an array
      let applications = [];
      if (Array.isArray(candidate)) applications = candidate;
      else if (candidate && typeof candidate === "object" && Object.keys(candidate).length) {
        // If the candidate is object containing an array under some key (like { bookingApplication: [...] })
        // try to find the first array property
        const firstArrayProp = Object.values(candidate).find((v) => Array.isArray(v));
        if (firstArrayProp) applications = firstArrayProp;
        else applications = [candidate]; // fallback: single object -> wrap
      } else {
        applications = [];
      }

      // Map to booking objects (do NOT wrap the booking inside another field like `Applications`)
      const mappedData = applications.map((booking) => ({
        // keep booking fields at top level so components can access booking.bookingNo, booking.address, etc.
        ...(booking || {}),
        // convenience labels for UI if you need them
        ADS_BOOKING_NUMBER_LABEL: booking?.bookingNo,
        ADS_APPLICANT_NAME: booking?.applicantDetail?.applicantName,
        ADS_BOOKING_STATUS_LABEL: booking?.bookingStatus,
      }));

      console.log("Processed data structure:", { applications, mappedData });

      return {
        data: mappedData,
        count: mappedData.length,
        rawResponse: res, // handy for debugging in your component (optional)
      };
    },
  });

  return { ...result, revalidate: () => client.invalidateQueries(key) };
};

/**
 * Employee hook variant (keeps parity with citizen hook)
 * Returns whatever the API returns but normalizes `data` to be the bookings array if possible.
 */
export const useADSSearchApplicationEmployee = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();
  const key = ["ADS_APPLICATIONS_LIST", JSON.stringify(params)];

  const result = useQuery(key, useADSSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (res) => {
      // Keep it simple for employee hook — try to surface the bookings array directly like citizen hook
      const root = res ?? {};
      const candidate = root?.bookingApplication ?? root?.bookings ?? root?.Applications ?? root?.data ?? root;

      let applications = [];
      if (Array.isArray(candidate)) applications = candidate;
      else if (candidate && typeof candidate === "object" && Object.keys(candidate).length) {
        const firstArrayProp = Object.values(candidate).find((v) => Array.isArray(v));
        if (firstArrayProp) applications = firstArrayProp;
        else applications = [candidate];
      } else {
        applications = [];
      }

      return {
        data: applications,
        count: applications.length,
        rawResponse: res,
      };
    },
  });

  return { ...result, revalidate: () => client.invalidateQueries(key) };
};
