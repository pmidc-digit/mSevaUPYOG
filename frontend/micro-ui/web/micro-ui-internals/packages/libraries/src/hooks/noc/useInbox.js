import useInbox from "../useInbox";
import { useQueryClient } from "react-query";

const useNOCInbox = ({ tenantId, filters, config = {} }) => {
  const queryClient = useQueryClient();
  console.log("filters in useInbox hook", filters);
  
  const { filterForm, searchForm, tableForm, getFilter } = filters;
  let { moduleName, businessService, applicationStatus, locality, assignee, businessServiceArray } = filterForm;
  const { mobileNumber, applicationNo } = searchForm;
  const { sortBy, limit, offset, sortOrder } = tableForm;
  const user = Digit.UserService.getUser();
  
  console.log("user here in useInbox", user);

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: assignee === "ASSIGNED_TO_ME" ? user?.info?.uuid : "",
      moduleName: "noc-service",
    //   businessService: businessService?.code ? [businessService?.code] : businessServiceArray,
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
      businessService:["obpas_noc"],
    },
    
    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber } : {}),
      ...(applicationNo ? { applicationNo } : {}),
      ...(sortOrder ? { sortOrder } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(locality?.length > 0 ? { locality: locality.map((item) => item.code.split("_").pop()).join(",") } : {}),
    },
    // sortBy,
    limit,
    offset,
    // sortOrder
  };

  const queryKey = ["INBOX_DATA", tenantId, ...Object.keys(_filters)?.map((e) => _filters?.[e])];

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => {
        const tableData = data?.items?.map((application) => {
          return {
            applicationId: application.businessObject?.applicationNo,
            date: parseInt(application.businessObject?.auditDetails?.createdTime),
            businessService: application?.ProcessInstance?.businessService,
            locality: `${application.businessObject?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
            status: `${application.businessObject.applicationStatus}`,
            owner: application?.businessObject?.nocDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName || "-",
          };
        });

        return {
        statuses: data.statusMap,
        table: tableData,
        totalCount: data.totalCount,
        nearingSlaCount: data.nearingSlaCount,
        revalidate: () => queryClient.invalidateQueries(queryKey)
       }
      },
      ...config,
    },
  });
};

export default useNOCInbox;
