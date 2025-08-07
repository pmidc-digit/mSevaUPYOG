import { useQuery, useQueryClient } from "react-query";

const useChallanGenerationSearchBill = ({ tenantId, filters }, config = {}) => {
  const client = useQueryClient();
  const args = tenantId ? { tenantId, filters } : { filters };
  const { isLoading, error, data } = useQuery(["billSearchList", tenantId, filters], () => Digit.ChallanGenerationService.search_bill(args), config);
  return { isLoading, error, data, revalidate: () => client.invalidateQueries(["billSearchList", tenantId, filters]) };
};

export default useChallanGenerationSearchBill;
