import { useQuery, useQueryClient } from "react-query";

export const useSwachComplaintsList = (tenantId, filters) => {
  // TODO: move city to state
  const client = useQueryClient();
  const { isLoading, error, data } = useQuery(["complaintsList", filters], () => Digit.SwachService.search(tenantId, filters), {});
  return { isLoading, error, data, revalidate: () => client.invalidateQueries(["complaintsList", filters]) };
};

export const useSwachComplaintsListByMobile = (tenantId, mobileNumber) => {
  return useSwachComplaintsList(tenantId, { mobileNumber });
};
