import useInbox from "../useInbox";
import { useQueryClient } from "react-query";

const getApplicationNo = (businessObject = {}) =>
  businessObject?.applicationNo ||
  businessObject?.applicationNumber ||
  businessObject?.fireNOCDetails?.applicationNumber ||
  "";

const getOwnerName = (businessObject = {}, processInstance) => {
  const owner = businessObject?.fireNOCDetails?.applicantDetails?.owners?.[0];
  return (
    owner?.name ||
    owner?.firmName ||
    processInstance?.assignes?.[0]?.name ||
    processInstance?.assigner?.name ||
    "-"
  );
};

const useFIRENOCInbox = ({ tenantId, filters, config = {} }) => {
  const queryClient = useQueryClient();
  const { filterForm, searchForm, tableForm } = filters;
  let { applicationStatus, locality, assignee, businessServiceArray } = filterForm;
  const { mobileNumber, applicationNo } = searchForm;
  const { sortBy, limit, offset, sortOrder } = tableForm;
  const user = Digit.UserService.getUser();

  if (!businessServiceArray?.length) {
    businessServiceArray = ["FIRE_NOC_SRV", "AIRPORT_NOC_SRV"];
  }

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: assignee === "ASSIGNED_TO_ME" ? user?.info?.uuid : "",
      moduleName: "firenoc-services",
      businessService: businessServiceArray,
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
    },
    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber } : {}),
      ...(applicationNo ? { applicationNo } : {}),
      ...(sortOrder ? { sortOrder } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(locality?.length > 0 ? { locality: locality.map((item) => item.code.split("_").pop()).join(",") } : {}),
    },
    limit,
    offset,
  };

  const queryKey = ["INBOX_DATA", tenantId, ...Object.keys(_filters)?.map((e) => _filters?.[e])];

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => {
        const tableData = data?.items?.map((application) => {
          const businessObject = application?.businessObject || {};
          const applicationId = getApplicationNo(businessObject);
          const status =
            businessObject?.fireNOCDetails?.status ||
            businessObject?.applicationStatus ||
            businessObject?.status ||
            "";

          return {
            applicationNo: applicationId,
            applicationId,
            date: parseInt(businessObject?.auditDetails?.createdTime),
            businessService: application?.ProcessInstance?.businessService,
            locality: `${businessObject?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
            status,
            owner: getOwnerName(businessObject, application?.ProcessInstance),
            action: application?.ProcessInstance?.action || "",
          };
        });

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

export default useFIRENOCInbox;
