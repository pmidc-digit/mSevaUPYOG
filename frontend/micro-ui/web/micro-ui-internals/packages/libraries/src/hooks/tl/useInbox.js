import React from "react";
import useInbox from "../useInbox";

const useTLInbox = ({ tenantId, filters = {}, config }) => {

  const { pgrQuery = {}, tlfilters = {}, wfFilters = {}, sortBy, sortOrder, sortParams, limit, offset } = filters;
  // Map sortParams from Table format [{id, desc}] to API format
  const effectiveSortBy = sortParams?.[0]?.id || sortBy || "applicationDate";
  const effectiveSortOrder = sortParams?.[0] ? (sortParams[0].desc ? "DESC" : "ASC") : (sortOrder || "DESC");
  // const { applicationStatus, mobileNumber, applicationNumber, sortBy, sortOrder, locality, uuid, limit, offset } = filters;
  const USER_UUID = Digit.UserService.getUser()?.info?.uuid;

  const applicationNumber = filters?.search?.applicationNumber;
  const mobileNumber = filters?.search?.mobileNumber;
  const tradeLicenseNumber = filters?.search?.tradeLicenseNumber;
  const applicationType = filters?.search?.applicationType;
  const fromDate = filters?.search?.fromDate;
  const toDate = filters?.search?.toDate;
  const ownerName = filters?.search?.ownerName;
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
      ...(tradeLicenseNumber ? { licenseNumbers: tradeLicenseNumber } : {}),
      ...(applicationType ? { applicationType: applicationType } : {}),
      ...(fromDate ? { fromDate: fromDate } : {}),
      ...(toDate ? { toDate: toDate } : {}),
      ...(ownerName ? { ownerName: ownerName } : {}),
      ...(serviceCode?.length > 0 ? { serviceCode: serviceCode } : {}),
      ...(locality?.length > 0
        ? {
            locality: locality,
          }
        : {}),

      //   ...(tenants?.length > 0 ? { tenantId: tenants } : {}),
      sortBy: effectiveSortBy,
      sortOrder: effectiveSortOrder,
    },

    limit,
    offset,
  };

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => ({
        statuses: data?.statusMap || [],
        table: data?.items?.map((application) => ({
          applicationId: application.businessObject?.applicationNumber || "N/A",
          licenseNumber: application.businessObject?.licenseNumber || "-",
          tradeName: application.businessObject?.tradeName || "-",
          ownerName: application.businessObject?.tradeLicenseDetail?.owners?.[0]?.name || "-",
          date: application.businessObject?.applicationDate || 0,
          financialYear: application.businessObject?.financialYear || "-",
          businessService: application?.ProcessInstance?.businessService || "N/A",
          locality: `${application.businessObject?.tenantId
            ?.toUpperCase()
            ?.split(".")
            ?.join("_")}_REVENUE_${application.businessObject?.tradeLicenseDetail?.address?.locality?.code?.toUpperCase()}`,
          status: application.businessObject?.status || "N/A",
          owner: application.ProcessInstance?.assigner?.name || "Unassigned",
          sla: application?.businessObject?.status?.match(/^(EXPIRED|APPROVED|CANCELLED)$/)
            ? "0"
            : Math.round((application.ProcessInstance?.businesssServiceSla || 0) / (24 * 60 * 60 * 1000)),
          tenantId: application.businessObject?.tenantId,
        })) || [],
        totalCount: data?.totalCount || 0,
        nearingSlaCount: data?.nearingSlaCount || 0,
      }),
      ...config,
    },
  });
};

export default useTLInbox;
