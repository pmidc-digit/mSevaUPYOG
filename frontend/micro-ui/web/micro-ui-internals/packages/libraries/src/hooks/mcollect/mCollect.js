import { useQuery } from "react-query";

export const useMCollectRecieptSearch = ({ tenantId, ...params }, config = {}) => {
  return useQuery(["mcollect_Reciept_Search", { tenantId, params }, config], () => Digit.MCollectService.recieptSearch(tenantId, params), {
    refetchOnMount: false,
    ...config,
  });
};
