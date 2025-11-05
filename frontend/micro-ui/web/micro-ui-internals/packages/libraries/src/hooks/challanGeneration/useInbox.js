import useInbox from "../useInbox";

const useChallanInbox = ({ tenantId, filters, config = {} }) => {
  const { offset, limit, sortOrder, challanNo, mobileNumber, businessService } = filters;
  console.log("filters", filters);
  // let { assignee } = filterForm;
  // const { applicationNumber } = searchForm;
  // const { mobileNumber } = searchForm;
  // const { limit, offset } = filters;
  const user = Digit.UserService.getUser();
  const status = filters?.filterForm?.applicationStatus;

  // const selectedStatuses = getFilter?.applicationStatus?.map((s) => s?.code) || [];

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: "",
      moduleName: "Challan_Generation",
      businessService: ["Challan_Generation"],
      ...(status?.length > 0 ? { status: status } : {}),
    },

    moduleSearchCriteria:
      status?.length > 0
        ? {
            status: status,
            sortOrder: sortOrder,
            ...(challanNo ? { challanNo } : {}),
            ...(mobileNumber ? { mobileNumber } : {}),
          }
        : {
            // status: status,
            sortOrder: sortOrder,
            ...(challanNo ? { challanNo } : {}),
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
          console.log("application===", application);
          const dataRes = application?.businessObject;
          const dataForm = application?.ProcessInstance;
          return {
            applicationId: dataRes?.challanNo,
            date: parseInt(dataRes?.auditDetails?.createdTime),
            businessService: dataForm?.businessService,
            status: `${dataRes.applicationStatus}`,
            offenceTypeName: dataRes?.offenceTypeName,
            amount: dataRes?.challanAmount,
            offenderName: dataRes?.citizen?.name,
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

export default useChallanInbox;
