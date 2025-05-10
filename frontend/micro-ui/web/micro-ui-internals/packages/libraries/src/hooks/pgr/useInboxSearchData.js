import { useQuery, useQueryClient } from "react-query";

const useInboxSearchData = (searchParams) => {
  const client = useQueryClient();

  const fetchInboxData = async () => {
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const { limit = 10, offset = 0 } = searchParams;
    console.log("searchParams", searchParams);
    console.log("searchParams.filters.pgrQuery", searchParams.filters.pgrQuery);

    const pgrQueryExtras = searchParams.filters.pgrQuery || {};
    const searchExtras = searchParams.search || {};
    let wfFilters = { ...searchParams.filters.wfQuery };

    const inboxPayload = {
      inbox: {
        tenantId,
        processSearchCriteria: {
          moduleName: pgrQueryExtras.moduleName || "pgr-services",
          businessService: pgrQueryExtras.businessService || ["PGR"],
          ...pgrQueryExtras.processSearchCriteria,
        },
        moduleSearchCriteria: {
          businessService: Array.isArray(pgrQueryExtras.businessService)
            ? pgrQueryExtras.businessService[0]
            : pgrQueryExtras.businessService || "PGR",
          sortOrder: pgrQueryExtras.sortOrder || "ASC",
          sortBy: pgrQueryExtras.sortBy || "applicationStatus",
          ...pgrQueryExtras.moduleSearchCriteria,
        },
        limit,
        offset,
        // if they searched by complaint no or mobile no:
        ...(searchExtras.serviceRequestId && { serviceRequestId: searchExtras.serviceRequestId }),
        ...(searchExtras.mobileNumber && { mobileNumber: searchExtras.mobileNumber }),
        // any other top‐level filters
        ...pgrQueryExtras,
        ...searchExtras,
      },
    };

    console.log("reaching to complaintne");
    const complaintDetailsResponse = await Digit.PGRService.Inboxsearch(tenantId, inboxPayload);
    complaintDetailsResponse.items.forEach((service) => serviceIds.push(service.service.serviceRequestId));
    const serviceIdParams = serviceIds.join();
    const workflowInstances = await Digit.WorkflowService.getByBusinessId(tenantId, serviceIdParams, wfFilters, false);
    if (workflowInstances.ProcessInstances.length) {
      combinedRes = combineResponses(complaintDetailsResponse, workflowInstances).map((data) => ({
        ...data,
        sla: Math.round(data.sla / (24 * 60 * 60 * 1000)),
      }));
    }
    return combinedRes;
  };

  const result = useQuery(
    [
      "fetchInboxData",
      ...Object.keys(searchParams).map((i) =>
        typeof searchParams[i] === "object" ? Object.keys(searchParams[i]).map((e) => searchParams[i][e]) : searchParams[i]
      ),
    ],
    fetchInboxData,
    { staleTime: Infinity }
  );
  return { ...result, revalidate: () => client.refetchQueries(["fetchInboxData"]) };
};

const mapWfBybusinessId = (wfs) => {
  return wfs.reduce((object, item) => {
    return { ...object, [item["businessId"]]: item };
  }, {});
};

const combineResponses = (complaintDetailsResponse, workflowInstances) => {
  let wfMap = mapWfBybusinessId(workflowInstances.ProcessInstances);
  let data = [];
  complaintDetailsResponse.ServiceWrappers.map((complaint) => {
    if (wfMap?.[complaint.service.serviceRequestId]) {
      data.push({
        serviceRequestId: complaint.service.serviceRequestId,
        complaintSubType: complaint.service.serviceCode,
        priorityLevel: complaint.service.priority,
        locality: complaint.service.address.locality.code,
        status: complaint.service.applicationStatus,
        taskOwner: wfMap[complaint.service.serviceRequestId]?.assignes?.[0]?.name || "-",
        sla: wfMap[complaint.service.serviceRequestId]?.businesssServiceSla,
        tenantId: complaint.service.tenantId,
      });
    }
  });
  return data;
};

export default useInboxSearchData;
