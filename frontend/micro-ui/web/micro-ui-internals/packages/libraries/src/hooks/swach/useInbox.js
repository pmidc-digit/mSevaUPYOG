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
  const status = filters?.filters?.swachfilters?.applicationStatus;
  const userId = filters?.filters?.wfQuery?.assignee;

  const _filters = {
    tenantId: tenants,
    processSearchCriteria: {
      moduleName: "swach-reform",
      businessService: ["SBMR"],
      // ...(status ? { status: status } : {}),
      ...(status?.length > 0 ? { status: status?.map((item) => item?.code) } : {}),
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
      // ...(uuid && Object.keys(uuid)?.length > 0 ? { assignee: uuid?.code === "ASSIGNED_TO_ME" ? USER_UUID : "" } : {}),
      ...(userId ? { assignee: userId ? userId : "" } : {}),
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
          // created date + SLA - current date =>
          const createdTime = complaint?.ProcessInstance?.auditDetails?.createdTime;
          // const stateSla = complaint.ProcessInstance?.stateSla;
          const currentTime = Date.now();
          // const slaEndTime = createdTime + stateSla;
          const timeLeftInMs = currentTime - createdTime;
          const timeLeftInHours = timeLeftInMs / (1000 * 60 * 60);

          const roundedHours = timeLeftInHours?.toFixed(1);

          const slaInMilliseconds = complaint?.ProcessInstance?.stateSla;
          // // Convert milliseconds to hours
          const totalHours = slaInMilliseconds / (1000 * 60 * 60);

          const roundedtotalHours = parseFloat(totalHours?.toFixed(1));
          // Convert remaining milliseconds to minutes
          return {
            serviceRequestId: complaint.ProcessInstance?.businessId,
            complaintSubType: complaint?.businessObject?.service?.serviceCode,
            priorityLevel: complaint.ProcessInstance?.priority,
            locality: complaint?.businessObject?.service?.address?.locality?.code,
            status: (() => {
              const stateValue = complaint?.ProcessInstance?.state?.state;
              if (stateValue === "PENDINGFORREASSIGNMENT") {
                return "PENDINGFORREASSIGNMENT";
              }
              if (stateValue === "REJECTED") {
                return "REJECTED";
              }
              return complaint?.ProcessInstance?.state?.applicationStatus;
            })(),
            taskOwner: complaint.ProcessInstance?.assigner?.name || "-",
            taskEmployee: complaint.ProcessInstance?.assignes?.[0]?.name || "-",
            sla: roundedtotalHours, // SLA in hours and minutes
            slaElapsed: roundedHours,
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
