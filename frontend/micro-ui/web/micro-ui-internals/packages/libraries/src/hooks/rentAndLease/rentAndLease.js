import { useQuery } from "react-query";

export const useRentAndLeaseRecieptSearch = ({ tenantId, ...params }, config = {}) => {
  return useQuery(["rentAndLease_Reciept_Search", { tenantId, params }, config], () => Digit.RentAndLeaseService.recieptSearch(tenantId, params), {
    refetchOnMount: false,
    ...config,
  });
};

export const useRentAndLeaseProperties = (filters, config = {}) => {
  return useQuery(["rentAndLease_Properties", filters, config], () => Digit.RentAndLeaseService.properties(filters), {
    ...config,
  });
};
