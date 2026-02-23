import useInbox from "../useInbox";

const useGCInbox = ({ tenantId, filters, config = {} }) => {
  const { businessService } = filters;
  const { applicationNumber, mobileNumber } = filters?.searchForm;

  console.log("filters", filters);

  // const appStatus = filters?.filterForm?.applicationStatus;

  // console.log("appStatus", appStatus);

  const { limit, offset, sortOrder, sortBy } = filters?.tableForm;
  const user = Digit.UserService.getUser();
  const status = filters?.filterForm?.applicationStatus;
  // const selectedStatuses = getFilter?.applicationStatus?.map((s) => s?.code) || [];

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: "",
      moduleName: "gc-services",
      businessService: ["NewGC", "ModifyGCConnection", "DisconnectGCConnection"],
      ...(status && status.length > 0 ? { status: status } : {}),
      // ...(status?.length > 0 ? { status: status } : {}),
    },

    moduleSearchCriteria:
      status?.length > 0
        ? {
            ...(status && status.length > 0 ? { challanStatus: status } : {}),
            sortOrder: sortOrder,
            ...(applicationNumber ? { applicationNumber } : {}),
            ...(businessService && businessService.length > 0 ? { offenceTypeName: businessService.join(",") } : {}),
            // ...(businessService ? { offenceTypeName: businessService } : {}),
            ...(mobileNumber ? { mobileNumber } : {}),
          }
        : {
            ...(status && status.length > 0 ? { challanStatus: status.join } : {}),
            sortOrder: sortOrder,
            ...(applicationNumber ? { applicationNumber } : {}),
            ...(businessService && businessService.length > 0 ? { offenceTypeName: businessService.join(",") } : {}),
            // ...(businessService ? { offenceTypeName: businessService } : {}),
            ...(mobileNumber ? { mobileNumber } : {}),
          },
    limit,
    offset,
  };

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => {
        const tableData = data?.items?.map((application) => {
          const dataRes = application?.businessObject;
          const dataForm = application?.ProcessInstance;
          return {
            applicationId: dataRes?.applicationNo,
            date: parseInt(dataRes?.auditDetails?.createdTime),
            businessService: dataForm?.businessService,
            status: `${dataRes.applicationStatus}`,
            applicationStatus: dataRes?.status,
          };
        });

        return {
          statuses: data.statusMap,
          table: tableData,
          totalCount: data.totalCount,
          nearingSlaCount: data.nearingSlaCount,
        };
      },
      ...config,
    },
  });
};

export default useGCInbox;
