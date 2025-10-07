// import { ADSSearch } from "../../services/molecules/ADS/Search";
// import { useQuery } from "react-query";

// const useADSApplicationDetail = (t, tenantId, bookingNo, config = {}, userType, args) => {

//   const defaultSelect = (data) => {
//      let applicationDetails = data.applicationDetails.map((obj) => {

//       return obj;
//     });

//     return {
//       applicationData : data,
//       applicationDetails
//     }
//   };

//   return useQuery(
//     ["APPLICATION_SEARCH", "ADS_SEARCH", bookingNo, userType, args],
//     () => ADSSearch.applicationDetails(t, tenantId, bookingNo, userType, args),
//     { select: defaultSelect, ...config }

//   );
// };

// export default useADSApplicationDetail;

import { useQuery, useQueryClient } from "react-query";
import { ADSServices } from "../../services/elements/ADS";

const useADSApplicationDetail = (tenantId, bookingNo, config = {}) => {
  const client = useQueryClient();

  return useQuery(
    ["ADS_APPLICATION_DETAIL", bookingNo],
    async () => {
      const response = await ADSServices.getApplicationDetail({ tenantId, bookingNo });
      return response;
    },
    {
      staleTime: Infinity,
      ...config,
    }
  );
};

export default useADSApplicationDetail;
