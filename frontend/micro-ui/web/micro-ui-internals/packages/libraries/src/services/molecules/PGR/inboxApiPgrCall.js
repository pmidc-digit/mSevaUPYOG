import { InboxGeneral } from "../../elements/InboxService"

/**
 * Builds the inbox filter object for the PGR API call
 */
const buildInboxFilters = ({ tenantId, filters = {} }) => {
  const { sortBy, sortOrder, limit, offset } = filters;
  const { search = {}, filters: nestedFilters = {} } = filters;
  
  const USER_UUID = Digit.UserService.getUser()?.info?.uuid;

  // Extract from search
  const serviceRequestId = search?.serviceRequestId;
  const mobileNumber = search?.mobileNumber;
  
  // Extract from nested filters
  const serviceCode = nestedFilters?.pgrQuery?.serviceCode;
  const locality = nestedFilters?.pgrQuery?.locality;
  const status = nestedFilters?.pgrfilters?.applicationStatus;
  const assignee = nestedFilters?.wfFilters?.assignee;

  return {
    tenantId: tenantId,
    processSearchCriteria: {
      moduleName: "pgr-services",
      businessService: ["PGR"],
      ...(status?.length > 0 ? { status: status?.map((item) => item?.code) } : {}),
      ...(assignee ? { assignee: assignee } : {}),
    },
    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber: mobileNumber } : {}),
      ...(serviceRequestId ? { serviceRequestId: serviceRequestId } : {}),
      ...(serviceCode?.length > 0 ? { serviceCode: serviceCode } : {}),
      ...(locality?.length > 0 ? { locality: locality } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    },
    limit,
    offset,
  };
};

/**
 * Transforms the raw API response to table format
 */
const transformInboxData = (data) => {
  return {
    table: data?.items?.map((complaint) => {
      // Calculate SLA elapsed time
      const createdTime = complaint?.ProcessInstance?.auditDetails?.createdTime;
      const currentTime = Date.now();
      const timeLeftInMs = currentTime - createdTime;
      const timeLeftInHours = timeLeftInMs / (1000 * 60 * 60);
      const roundedHours = timeLeftInHours?.toFixed(1);

      // Calculate total SLA
      const slaInMilliseconds = complaint?.ProcessInstance?.stateSla;
      const totalHours = slaInMilliseconds / (1000 * 60 * 60);
      const roundedtotalHours = parseFloat(totalHours?.toFixed(1));

      return {
        serviceRequestId: complaint.ProcessInstance?.businessId,
        complaintSubType: complaint?.businessObject?.service?.serviceCode,
        priorityLevel: complaint.ProcessInstance?.priority,
        locality: complaint?.businessObject?.service?.address?.locality?.code,
        status: (() => {
          const stateValue = complaint?.ProcessInstance?.state?.state;
          if (stateValue === "PENDINGFORREASSIGNMENT") return "PENDINGFORREASSIGNMENT";
          if (stateValue === "REJECTED") return "REJECTED";
          return complaint?.ProcessInstance?.state?.applicationStatus;
        })(),
        taskOwner: complaint.ProcessInstance?.assigner?.name || "-",
        taskEmployee: complaint.ProcessInstance?.assignes?.[0]?.name || "-",
        sla: roundedtotalHours,
        slaElapsed: roundedHours,
        tenantId: complaint.ProcessInstance?.tenantId,
        createdDate: new Date(complaint.ProcessInstance?.auditDetails?.createdTime)?.toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    }) || [],
    totalCount: data?.totalCount,
    nearingSlaCount: data?.nearingSlaCount,
  };
};

/**
 * Main function to fetch and transform inbox data
 * @param {Object} params - { tenantId, filters }
 * @returns {Object} - Transformed inbox data with table, totalCount, nearingSlaCount
 */
const InboxApiPgrCall = async ({ tenantId, filters = {} }) => {
  try {
    // Build the filter object
    const inboxFilters = buildInboxFilters({ tenantId, filters });
    
    // Call the API
    const response = await InboxGeneral.Search({ inbox: inboxFilters });
    
    // Transform the response
    const transformedData = transformInboxData(response);
    
    return transformedData;
  } catch (error) {
    throw new Error(error?.response?.data?.Errors?.[0]?.message || error.message);
  }
};

export default InboxApiPgrCall;
