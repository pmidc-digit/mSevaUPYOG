import { useQuery } from "react-query";
import { FIRENOCService } from "../../services/elements/FIRENOC";

const useNOCSearchByNumber = ({ tenantId, filters, config = {} }) =>
  useQuery(
    ["NOC_SEARCH_BY_NUMBER", tenantId, ...Object.keys(filters)?.map((e) => filters?.[e])],
    () => FIRENOCService.search({ filters }),
    {
      ...config,
    }
  );

export const useFIRENOCMyApplications = (mobileNumber) => {
  const stateId = Digit.ULBService.getStateId();
  return useQuery(
    ["FIRENOC_MY_APPLICATIONS", mobileNumber],
    () => FIRENOCService.search({ filters: { tenantId: stateId, mobileNumber } }),
    {
      enabled: !!mobileNumber,
      select: (res) => res?.FireNOCs || [],
      staleTime: 30000,
    }
  );
};

export const useFIRENOCApplicationDetails = ({ tenantId, applicationNumber }) =>
  useQuery(
    ["FIRENOC_APP_DETAILS", tenantId, applicationNumber],
    () => FIRENOCService.search({ filters: { tenantId, applicationNumber } }),
    {
      enabled: !!tenantId && !!applicationNumber,
      select: (res) => res?.FireNOCs?.[0] || null,
    }
  );

export default useNOCSearchByNumber;
