import { useQuery, useQueryClient } from "react-query";
import { FIRENOCService } from "../../services/elements/FIRENOC";

const useFirenocInbox = ({ tenantId, filters, config = {} }) => {
  const queryClient = useQueryClient();

  const { filterForm, searchForm, tableForm } = filters;
  const { areaType, nocType } = filterForm;
  const { mobileNumber, applicationNo, fireNOCNumber, applicationStatus, fromDate, toDate } = searchForm;

  const queryParams = {
    tenantId,
    ...(mobileNumber ? { mobileNumber } : {}),
    ...(applicationNo ? { applicationNumber: applicationNo } : {}),
    ...(fireNOCNumber ? { fireNOCNumber } : {}),
    ...(fromDate ? { fromDate: new Date(fromDate).getTime() } : {}),
    ...(toDate ? { toDate: new Date(toDate).setHours(23, 59, 59, 999) } : {}),
    ...(areaType?.code ? { areaType: areaType.code } : {}),
    ...(nocType?.code ? { fireNOCType: nocType.code } : {}),
    ...(applicationStatus?.code ? { applicationStatus: applicationStatus.code } : {}),
  };

  const queryKey = ["FIRENOC_SEARCH_DATA", ...Object.values(queryParams)];

  return useQuery(
    queryKey,
    () => FIRENOCService.search({ filters: queryParams }),
    {
      select: (data) => {
        const tableData = (data?.FireNOCs || []).map((noc) => ({
          applicationId: noc?.fireNOCDetails?.applicationNumber,
          date: parseInt(noc?.fireNOCDetails?.applicationDate || noc?.auditDetails?.createdTime),
          status: noc?.fireNOCDetails?.status || "-",
          owner: noc?.fireNOCDetails?.applicantDetails?.owners?.[0]?.name || "-",
          action: noc?.fireNOCDetails?.action || "-",
        }));

        return {
          statuses: [],
          table: tableData,
          totalCount: data?.count || tableData.length,
          revalidate: () => queryClient.invalidateQueries(queryKey),
        };
      },
      ...config,
    }
  );
};

export default useFirenocInbox;
