import React from "react";
import useInbox from "../useInbox";

const useSWACHInbox = ({ tenantId, filters = {}, config }) => {
  const { pgrQuery = {}, swachfilters = {}, wfFilters = {}, sortBy, sortOrder, limit, offset } = filters;
  //   const { applicationStatus, mobileNumber, serviceRequestId, serviceCode, locality, tenants, sortBy, sortOrder, uuid, limit, offset } = filters;

  const uuid = wfFilters?.assignee?.[0];
  const USER_UUID = Digit.UserService.getUser()?.info?.uuid;

  //   const { applicationStatus = [], serviceCode = [], locality = [], tenants = [] } = swachfilters;

  const serviceRequestId = filters?.search?.serviceRequestId;
  const mobileNumber = filters?.search?.mobileNumber;
  const applicationStatus = "";
  const serviceCode = filters?.filters?.pgrQuery?.serviceCode;
  const locality = filters?.filters?.pgrQuery?.locality;
  const tenants = filters?.filters?.swachfilters?.tenants;

  const _filters = {
    tenantId: tenants,
    processSearchCriteria: {
      moduleName: "swach-reform",
      businessService: ["SBMR"],
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
      ...(uuid && Object.keys(uuid).length > 0 ? { assignee: uuid.code === "ASSIGNED_TO_ME" ? USER_UUID : "" } : {}),
    },
    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber: mobileNumber } : {}),
      ...(serviceRequestId ? { serviceRequestId: serviceRequestId } : {}),
      ...(serviceCode?.length > 0 ? { serviceCode: serviceCode } : {}),
      ...(locality?.length > 0
        ? {
            locality: locality,
          }
        : {}),
      //   ...(tenants?.length > 0 ? { tenantId: tenants } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    },
    // moduleSearchCriteria: {
    //   ...(mobileNumber ? { mobileNumber } : {}),
    //   ...(serviceRequestId ? { serviceRequestId } : {}),
    //   ...(locality ? { locality } : {}),
    //   ...(tenants ? { tenantId } : {}),
    //   ...(serviceCode ? { serviceCode } : {}),
    //   ...(sortBy ? { sortBy } : {}),
    //   ...(sortOrder ? { sortOrder } : {}),
    //   ...(locality?.length > 0 ? { locality: locality?.map((item) => item?.code?.split("_")?.pop())?.join(",") } : {}),
    // },
    limit,
    offset,
  };

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => ({
        table: data?.items?.map((complaint) => {
          const slaInMilliseconds = complaint.ProcessInstance?.businesssServiceSla;
          // Convert milliseconds to hours
          const totalHours = Math.floor(slaInMilliseconds / (1000 * 60 * 60));
          // Convert remaining milliseconds to minutes
          const totalMinutes = Math.floor((slaInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
          return {
            serviceRequestId: complaint.ProcessInstance?.businessId,
            complaintSubType: complaint?.businessObject?.service?.serviceCode,
            priorityLevel: complaint.ProcessInstance?.priority,
            locality: complaint?.businessObject?.service?.address?.locality?.code,
            status: complaint.ProcessInstance?.state?.applicationStatus,
            taskOwner: complaint.ProcessInstance?.assigner?.name || "-",
            sla: totalHours, // SLA in hours and minutes
            // sla: `${totalHours}.${totalMinutes}`, // SLA in hours and minutes
            // sla: complaint.ProcessInstance?.businesssServiceSla,
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
        }),
        totalCount: data?.totalCount,
        nearingSlaCount: data?.nearingSlaCount,
      }),
      ...config,
    },
  });
};

export default useSWACHInbox;
