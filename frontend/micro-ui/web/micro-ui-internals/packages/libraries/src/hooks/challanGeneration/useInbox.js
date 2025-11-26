import useInbox from "../useInbox";

const useChallanInbox = ({ tenantId, filters, config = {} }) => {
  const { offset, limit, sortOrder, challanNo, mobileNumber, businessService, status } = filters;
  // let { assignee } = filterForm;
  // const { applicationNumber } = searchForm;
  // const { mobileNumber } = searchForm;
  // const { limit, offset } = filters;
  const user = Digit.UserService.getUser();
  // const status = filters?.filterForm?.applicationStatus;
  // const selectedStatuses = getFilter?.applicationStatus?.map((s) => s?.code) || [];

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: "",
      moduleName: "Challan_Generation",
      businessService: ["Challan_Generation"],
      ...(status && status.length > 0 ? { status: status } : {}),
      // ...(status?.length > 0 ? { status: status } : {}),
    },

    moduleSearchCriteria:
      status?.length > 0
        ? {
            // ...(status && status.length > 0 ? { challanStatus: status } : {}),
            sortOrder: sortOrder,
            ...(challanNo ? { challanNumber: challanNo } : {}),
            ...(businessService && businessService.length > 0 ? { offenceTypeName: businessService.join(",") } : {}),
            // ...(businessService ? { offenceTypeName: businessService } : {}),
            ...(mobileNumber ? { mobileNumber } : {}),
          }
        : {
            // ...(status && status.length > 0 ? { challanStatus: status.join } : {}),
            sortOrder: sortOrder,
            ...(challanNo ? { challanNumber: challanNo } : {}),
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
          const finalAmount = Math.max(dataRes?.amount?.[0]?.amount || 0, dataRes?.challanAmount || 0);
          return {
            applicationId: dataRes?.challanNo,
            date: parseInt(dataRes?.auditDetails?.createdTime),
            businessService: dataForm?.businessService,
            status: `${dataRes.applicationStatus}`,
            offenceTypeName: dataRes?.offenceTypeName,
            amount: finalAmount,
            offenderName: dataRes?.citizen?.name,
            challanStatus: dataRes?.challanStatus,
            feeWaiver: dataRes?.feeWaiver,
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
