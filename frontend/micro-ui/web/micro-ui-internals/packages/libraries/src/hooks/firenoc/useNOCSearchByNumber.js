import { useQuery, useQueryClient } from "react-query";
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

export const useFIRENOCSearchApplication = (params, tenantId, config = {}) => {
  const client = useQueryClient();

  // Create filters copy
  const apiFilters = { ...params };
  if (apiFilters.applicationNo) {
    apiFilters.applicationNumber = apiFilters.applicationNo;
    delete apiFilters.applicationNo;
  }

  // Strip unsupported pagination/sorting query params for legacy firenoc search API
  delete apiFilters.offset;
  delete apiFilters.limit;
  delete apiFilters.sortBy;
  delete apiFilters.sortOrder;

  // Preserve the city-level tenantId (e.g. "pb.amritsar") to support city-level searches by mobile number
  if (tenantId && !apiFilters.tenantId) {
    apiFilters.tenantId = tenantId;
  }

  const result = useQuery(
    ["FIRENOC_SEARCH_APPLICATION", apiFilters],
    () => FIRENOCService.search({ filters: apiFilters }),
    {
      staleTime: Infinity,
      ...config,
      select: (data) => {
        let tableData;
        const fireNocs = data?.FireNOCs || [];

        if (fireNocs.length === 0) {
          tableData = [{ display: "ES_COMMON_NO_DATA" }];
        } else {
          tableData = fireNocs.map((app) => ({
            applicationNo: app?.fireNOCDetails?.applicationNumber,
            date: Digit.DateUtils.ConvertEpochToDate(app?.auditDetails?.createdTime),
            locality: app?.fireNOCDetails?.propertyDetails?.address?.locality?.name || `${app?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
            applicationStatus: app?.fireNOCDetails?.status,
          }));
        }

        return {
          data: tableData,
          totalCount: fireNocs.length || 0,
        };
      },
    }
  );

  return { ...result, revalidate: () => client.invalidateQueries(["FIRENOC_SEARCH_APPLICATION", apiFilters]) };
};

export default useNOCSearchByNumber;
