import useInbox from "../useInbox";

const useNDCInbox = ({ tenantId, filters, config = {} }) => {
  const { filterForm, searchForm, tableForm, getFilter } = filters;
  let { assignee } = filterForm;
  const { applicationNo } = searchForm;
  const { limit, offset } = tableForm;
  const user = Digit.UserService.getUser();
  const status = filters?.filterForm?.applicationStatus;

  console.log("filters==", filters?.filterForm?.applicationStatus);

  const selectedStatuses = getFilter?.applicationStatus?.map((s) => s?.code) || [];

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: assignee === "ASSIGNED_TO_ME" ? user?.info?.uuid : "",
      moduleName: "NDC",
      businessService: ["ndc-services"],
      ...(selectedStatuses.length > 0 ? { status: selectedStatuses } : {}),
    },

    moduleSearchCriteria: status.length > 0 ? {
      status: status,
      ...(applicationNo ? { applicationNo } : {}),
    } : {
      // status: status,
      ...(applicationNo ? { applicationNo } : {}),
    },
    limit,
    offset,
  };

  // return useInbox({
  //   tenantId,
  //   filters: _filters,
  //   config: {
  //     select: (data) => ({
  //       statuses: data.statusMap,
  //       table: data?.items.map((application) => ({
  //         applicationId: application.businessObject.applicationNo,
  //         date: parseInt(application.businessObject?.auditDetails?.createdTime),
  //         businessService: application?.ProcessInstance?.businessService,
  //         locality: `${application.businessObject?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
  //         status: `WF_${application.businessObject.additionalDetails.workflowCode}_${application.businessObject.applicationStatus}`, //application.businessObject.applicationStatus,
  //         owner: application?.ProcessInstance?.assignes?.[0]?.name || "-",
  //         source: application.businessObject.source,
  //         sla: application?.businessObject?.applicationStatus.match(/^(APPROVED)$/)
  //           ? "CS_NA"
  //           : Math.round(application.ProcessInstance?.businesssServiceSla / (24 * 60 * 60 * 1000)),
  //       })),
  //       totalCount: data.totalCount,
  //       nearingSlaCount: data.nearingSlaCount,
  //     }),
  //     ...config,
  //   },
  // });
  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => {
        const tableData = data?.items?.map((application) => {
          return {
            applicationId: application.businessObject?.uuid,
            date: parseInt(application.businessObject?.auditDetails?.createdTime),
            businessService: application?.ProcessInstance?.businessService,
            locality: `${application.businessObject?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
            status: `${application.businessObject.applicationStatus}`,
            owner: application?.ProcessInstance?.assigner?.[0]?.name || "-",
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

export default useNDCInbox;