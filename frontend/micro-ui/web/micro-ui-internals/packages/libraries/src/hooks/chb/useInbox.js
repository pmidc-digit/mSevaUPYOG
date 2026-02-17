import useInbox from "../useInbox";

const useCHBInbox = ({ tenantId, filters, config = {} }) => {
  const { filterForm, searchForm, tableForm, getFilter } = filters;
  let { assignee } = filterForm;
  const { applicationNumber } = searchForm;
  const { mobileNumber } = searchForm;
  const { limit, offset } = tableForm;
  const user = Digit.UserService.getUser();
  const status = filters?.filterForm?.applicationStatus;

  const selectedStatuses = getFilter?.applicationStatus?.map((s) => s?.code) || [];

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: assignee === "ASSIGNED_TO_ME" ? user?.info?.uuid : "",
      moduleName: "CHB",
      businessService: ["chb-services"],
      ...(status.length > 0 ? { status: status } : {}),
    },

    moduleSearchCriteria:
      status.length > 0
        ? {
            status: status,
            sortOrder: "DESC",
            ...(applicationNumber ? { applicationNumber } : {}),
            ...(mobileNumber ? { mobileNumber } : {}),
          }
        : {
            // status: status,
            sortOrder: "DESC",
            ...(applicationNumber ? { applicationNumber } : {}),
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
            applicationId: dataRes?.bookingNo,
            date: parseInt(dataRes?.auditDetails?.createdTime),
            businessService: dataForm?.businessService,
            locality: `${dataRes?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
            status: `${dataRes.bookingStatus}`,
            owner: dataRes?.applicantDetail?.name || "-",
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

export default useCHBInbox;
