import { useQuery, useQueryClient } from "react-query";

const useChallanGenerationSearch = ({ tenantId, filters, isChallanGenerationAppChanged }, config = {}) => {
  if (filters.status && filters.status.length > 0) {
    filters.status = filters.status.toString();
  } else if (filters.status && filters.status.length === 0) {
    delete filters.status;
  }

  if (filters.businessService && filters.businessService.length > 0) {
    filters.businessService = filters.businessService.toString();
  } else if (filters.businessService && filters.businessService.length === 0) {
    delete filters.businessService;
  }

  const client = useQueryClient();
  const args = tenantId ? { tenantId, filters } : { filters };
  const { isLoading, error, data } = useQuery(
    ["challanGenerationSearchList", tenantId, filters, isChallanGenerationAppChanged],
    () => Digit.ChallanGenerationService.search(args),
    config
  );
  return { isLoading, error, data, revalidate: () => client.invalidateQueries(["propertySearchList", tenantId, filters]) };
};

export default useChallanGenerationSearch;
