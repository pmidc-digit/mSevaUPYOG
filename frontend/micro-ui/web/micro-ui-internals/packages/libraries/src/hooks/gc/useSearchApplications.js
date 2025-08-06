import { NOCSearch } from "../../services/molecules/NOC/Search";
import { useQuery } from "react-query";

const useGCSearchApplication = (tenantId, filters, config = {}) => {
  return useQuery(["APPLICATION_SEARCH", "NOC_SEARCH", tenantId, ...Object.entries(filters)], () => NOCSearch.all(tenantId, filters), config);
};

export default useGCSearchApplication;
