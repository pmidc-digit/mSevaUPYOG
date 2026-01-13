import React from "react";
import useInbox from "../useInbox";

const useTLInbox = ({ tenantId, filters = {}, config }) => {
  console.log("filters coming useTLInbox ", filters);

  const { pgrQuery = {}, tlfilters = {}, wfFilters = {}, sortBy, sortOrder, limit, offset } = filters;
  //const { applicationStatus, mobileNumber, applicationNumber, sortBy, sortOrder, locality, uuid, limit, offset } = filters;
  const USER_UUID = Digit.UserService.getUser()?.info?.uuid;

  const applicationNumber = filters?.search?.applicationNumber;
  const mobileNumber = filters?.search?.mobileNumber;
  const applicationStatus = "";
  const serviceCode = filters?.filters?.pgrQuery?.serviceCode;
  const locality = filters?.filters?.pgrQuery?.locality;
  const tenants = filters?.filters?.tlfilters?.tenants;
  const status = filters?.filters?.tlfilters?.applicationStatus;
  const userId = filters?.filters?.wfQuery?.assignee;

  //   const _filters = {
  //     tenantId,
  //     processSearchCriteria: {
  //       moduleName: "tl-services",
  //       businessService: ["NewTL", "DIRECTRENEWAL", "EDITRENEWAL"],
  //       ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
  //       ...(uuid && Object.keys(uuid).length > 0 ? { assignee: uuid.code === "ASSIGNED_TO_ME" ? USER_UUID : "" } : {}),
  //     },
  //     moduleSearchCriteria: {
  //       ...(mobileNumber ? { mobileNumber } : {}),
  //       ...(applicationNumber ? { applicationNumber } : {}),
  //       ...(sortBy ? { sortBy } : {}),
  //       ...(sortOrder ? { sortOrder } : {}),
  //       ...(locality?.length > 0 ? { locality: locality.map((item) => item.code.split("_").pop()).join(",") } : {}),
  //     },
  //     limit,
  //     offset,
  //   };

  const _filters = {
    tenantId: tenantId,
    processSearchCriteria: {
      moduleName: "tl-services",
      businessService: ["NEWTL.NHAZ", "NEWTL.HAZ","NewTL", "DIRECTRENEWAL", "EDITRENEWAL"],
      //...(status?.length > 0 ? { status: status } : {}),
      ...(status?.length > 0 ? { status: status?.map((item) => item?.code) } : {}),
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
      // ...(uuid && Object.keys(uuid)?.length > 0 ? { assignee: uuid?.code === "ASSIGNED_TO_ME" ? USER_UUID : "" } : {}),
      ...(userId ? { assignee: userId ? userId : "" } : {}),
    },
    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber: mobileNumber } : {}),
      ...(applicationNumber ? { applicationNumber: applicationNumber } : {}),
      ...(serviceCode?.length > 0 ? { serviceCode: serviceCode } : {}),
      ...(locality?.length > 0
        ? {
            locality: locality,
          }
        : {}),

      //   ...(tenants?.length > 0 ? { tenantId: tenants } : {}),
      ...(sortBy ? { sortBy } : {}),
      sortOrder: "DESC",
    },

    limit,
    offset,
  };

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => ({
        statuses: data.statusMap,
        table: data?.items.map((application) => ({
          applicationId: application.businessObject.applicationNumber,
          date: application.businessObject.applicationDate,
          businessService: application?.ProcessInstance?.businessService,
          locality: `${application.businessObject?.tenantId
            ?.toUpperCase()
            ?.split(".")
            ?.join("_")}_REVENUE_${application.businessObject?.tradeLicenseDetail?.address?.locality?.code?.toUpperCase()}`,
          status: application.businessObject.status,
          owner: application.ProcessInstance?.assigner?.name,
          sla: application?.businessObject?.status.match(/^(EXPIRED|APPROVED|CANCELLED)$/)
            ? "0"
            : Math.round(application.ProcessInstance?.businesssServiceSla / (24 * 60 * 60 * 1000)),
        })),
        totalCount: data.totalCount,
        nearingSlaCount: data?.nearingSlaCount,
      }),
      ...config,
    },
  });
};

export default useTLInbox;
