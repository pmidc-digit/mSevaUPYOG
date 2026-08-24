import { useQuery } from "react-query";

const useBPADetailsPage = (tenantId, filters, config) => {
  return useQuery(
    ['BPA_DETAILS_PAGE', filters, tenantId],
    () => Digit.OBPSService.BPADetailsPage(tenantId, filters),
    {
      staleTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
      ...config,
    }
  );
}

export default useBPADetailsPage;