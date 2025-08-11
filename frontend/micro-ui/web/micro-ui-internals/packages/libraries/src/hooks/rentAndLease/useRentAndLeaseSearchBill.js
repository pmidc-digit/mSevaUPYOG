import { useQuery, useQueryClient } from "react-query";

const useRentAndLeaseSearchBill = ({ tenantId, filters }, config = {}) => {
  const client = useQueryClient();
  const args = tenantId ? { tenantId, filters } : { filters };
  const { isLoading, error, data } = useQuery(["billSearchList", tenantId, filters], () => Digit.RentAndLeaseService.search_bill(args), config);
  return { isLoading, error, data, revalidate: () => client.invalidateQueries(["billSearchList", tenantId, filters]) };
};

export default useRentAndLeaseSearchBill;
