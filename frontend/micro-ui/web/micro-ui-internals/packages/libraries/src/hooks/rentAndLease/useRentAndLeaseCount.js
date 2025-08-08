import { useQuery, useQueryClient } from "react-query";

const useRentAndLeaseCount = (tenantId, config = {}) => {
  return useQuery(["RentAndLease_COUNT", tenantId], () => Digit.RentAndLeaseService.count(tenantId), config);
};

export default useRentAndLeaseCount;
