import useInbox from "../useInbox";
import { useQueryClient } from "react-query";

const useFirenocInbox = ({ tenantId, filters, config = {} }) => {
  const queryClient = useQueryClient();

  const { filterForm, searchForm, tableForm } = filters;
  const { areaType, nocType } = filterForm;
  const { mobileNumber, applicationNo, fireNOCNumber, applicationStatus, fromDate, toDate } = searchForm;
  const { sortBy, limit, offset, sortOrder } = tableForm;
  const user = Digit.UserService.getUser();

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: "",
      moduleName: "firenoc",
      businessService: ["FIRE_NOC_SRV", "AIRPORT_NOC_SRV"],
      ...(applicationStatus?.code ? { status: [applicationStatus.code] } : {}),
    },
    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber } : {}),
      ...(applicationNo ? { applicationNo } : {}),
      ...(fireNOCNumber ? { fireNOCNumber } : {}),
      ...(fromDate ? { fromDate: new Date(fromDate).getTime() } : {}),
      ...(toDate ? { toDate: new Date(toDate).setHours(23, 59, 59, 999) } : {}),
      ...(areaType?.code ? { areaType: areaType.code } : {}),
      ...(nocType?.code ? { nocType: nocType.code } : {}),
      ...(sortOrder ? { sortOrder } : {}),
      ...(sortBy ? { sortBy } : {}),
    },
    limit,
    offset,
  };

  const queryKey = ["FIRENOC_INBOX_DATA", tenantId, ...Object.keys(_filters)?.map((e) => _filters?.[e])];

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => {
        const tableData = data?.items?.map((application) => ({
          applicationId: application.businessObject?.applicationNo,
          date: parseInt(application.businessObject?.auditDetails?.createdTime),
          businessService: application?.ProcessInstance?.businessService,
          locality: `${application.businessObject?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
          status: `${application.businessObject?.applicationStatus}`,
          owner: application?.businessObject?.nocDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName || "-",
          action: `${application?.ProcessInstance?.action}`,
        }));

        return {
          statuses: data.statusMap,
          table: tableData,
          totalCount: data.totalCount,
          nearingSlaCount: data.nearingSlaCount,
          revalidate: () => queryClient.invalidateQueries(queryKey),
        };
      },
      ...config,
    },
  });
};

export default useFirenocInbox;
