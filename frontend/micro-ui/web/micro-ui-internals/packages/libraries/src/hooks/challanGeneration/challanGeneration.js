import { useQuery } from "react-query";

export const useChallanGenerationRecieptSearch = ({ tenantId, ...params }, config = {}) => {
  return useQuery(["challangeneration_Reciept_Search", { tenantId, params }, config], () => Digit.ChallanGenerationService.recieptSearch(tenantId, params), {
    refetchOnMount: false,
    ...config,
  });
};
