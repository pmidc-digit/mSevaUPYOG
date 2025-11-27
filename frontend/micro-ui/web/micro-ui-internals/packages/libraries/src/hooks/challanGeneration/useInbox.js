import useInbox from "../useInbox";

const useChallanInbox = ({ tenantId, filters, config = {} }) => {
  const { offset, limit, sortOrder, challanNo, mobileNumber = "", businessService, status } = filters || {};

  const moduleSearchCriteria = {
    sortOrder,
    ...(challanNo ? { challanNumber: challanNo } : {}),
    ...(businessService && businessService.length > 0 ? { offenceTypeName: businessService.join(",") } : {}),
    // mobileNumber: mobileNumber || "",
    ...(mobileNumber ? { mobileNumber } : {}),
  };

  const _filters = {
    tenantId,

    processSearchCriteria: {
      assignee: "",
      moduleName: "Challan_Generation",
      businessService: ["Challan_Generation"],
      ...(status?.length > 0 ? { status } : {}),
    },

    moduleSearchCriteria,

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
            status: `${dataRes?.applicationStatus}`,
            offenceTypeName: dataRes?.offenceTypeName,
            amount: finalAmount,
            offenderName: dataRes?.citizen?.name,
            challanStatus: dataRes?.challanStatus,
            feeWaiver: dataRes?.feeWaiver,
          };
        });

        return {
          statuses: data?.statusMap,
          table: tableData,
          totalCount: data?.totalCount,
          nearingSlaCount: data?.nearingSlaCount,
        };
      },
      ...config,
    },
  });
};

export default useChallanInbox;
