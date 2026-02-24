import { OBPS_BPA_BUSINESS_SERVICES } from "../../../../constants/constants";
import useInbox from "../useInbox";
import { useTranslation } from "react-i18next";

const useBPAInbox = ({ tenantId, filters, config = {} }) => {
  const { filterForm, searchForm, tableForm } = filters;
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  let { moduleName, businessService, applicationStatus, locality, assignee, applicationType, licenseType } = filterForm;
  const { mobileNumber, applicationNo } = searchForm;
  const { sortBy, limit, offset, sortOrder } = tableForm;
  let applicationNumber = "";
  if (window.location.href.includes("stakeholder-inbox")) moduleName = "BPAREG";
  if (moduleName == "BPAREG") {
    applicationNumber = applicationNo;
    // tenantId = Digit.ULBService.getStateId();
  }
  if (
    applicationType === "BUILDING_OC_PLAN_SCRUTINY" &&
    (window.location.href.includes("obps/inbox") || window.location.href.includes("obps/bpa/inbox"))
  ) {
    businessService = OBPS_BPA_BUSINESS_SERVICES;
  }

  let _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: assignee === "ASSIGNED_TO_ME" ? user?.info?.uuid : "",
      moduleName: moduleName !== "BPAREG" ? "bpa-service" : "BPAREG",
      businessService:
        moduleName !== "BPAREG"
          ? businessService
            ? [businessService]
            : OBPS_BPA_BUSINESS_SERVICES
          : licenseType && licenseType.filter(item => item).length > 0
          ? licenseType.filter(item => item)
          : businessService
          ? [businessService.identifier]
          // ? [businessService]
          :["ARCHITECT", "ENGINEER", "TOWNPLANNER", "SUPERVISOR", "ARCHITECT_UPGRADE", "BPAREG_UPGRADE"],
          // : ["ARCHITECT", "BUILDER", "ENGINEER", "STRUCTURALENGINEER", "TOWNPLANNER", "SUPERVISOR"],
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
    },
    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber } : {}),
      ...(!applicationNumber ? (applicationNo ? { applicationNo } : {}) : applicationNumber ? { applicationNumber } : {}),
      ...(applicationNumber ? { applicationNumber } : {}),
      ...(sortOrder ? { sortOrder } : {}),
      ...(sortBy ? { sortBy } : {}),
      // ...(applicationType?.length > 0 ? {applicationType: applicationType.map((item) => item.code).join(",")} : {}),
      ...(applicationType && applicationType?.length > 0 ? { applicationType } : {}),
      ...(locality?.length > 0 ? { locality: locality.map((item) => item.code.split("_").pop()).join(",") } : {}),
    },
    limit,
  };

  if (!applicationNo) {
    _filters = { ..._filters, offset };
  }

  const getDaysSinceCreated = (createdTime) => {
    if (!createdTime) return "CS_NA";

    const today = Date.now(); // current time in epoch (ms)
    const diffInMs = today - createdTime;

    return Math.floor(diffInMs / (24 * 60 * 60 * 1000));
  };

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => ({
        statuses: data.statusMap,
        table: data?.items.map((application) => ({
          applicationId: application.businessObject.applicationNo || application.businessObject.applicationNumber,
          date: application.businessObject.auditDetails.createdTime,
          submissionDate: application?.ProcessInstance?.auditDetails?.lastModifiedTime,
          businessService: application?.ProcessInstance?.businessService,
          applicationType: application?.businessObject?.additionalDetails?.applicationType
            ? `WF_BPA_${application?.businessObject?.additionalDetails?.applicationType}`
            : "-",
          locality: `${application.businessObject?.tenantId
            ?.toUpperCase()
            ?.split(".")
            ?.join("_")}_REVENUE_${application.businessObject?.landInfo?.address?.locality?.code?.toUpperCase()}`,
          status: application?.ProcessInstance?.state?.state,
          state: application?.ProcessInstance?.state?.state,
          owner: application?.businessObject?.landInfo?.owners?.find(item => item?.isPrimaryOwner)?.name || "NA",
          mobileNumber: application?.businessObject?.tradeLicenseDetail?.owners?.[0]?.mobileNumber || "NA",
          sla: application?.businessObject?.status.match(/^(APPROVED)$/)
            ? "CS_NA"
            : getDaysSinceCreated(application?.ProcessInstance?.auditDetails?.createdTime),
          assignedOwner: application?.ProcessInstance?.assignes?.[0]?.name || t("DOCUMENT_VERIFIER",)
        })),
        totalCount: data.totalCount,
        nearingSlaCount: data?.nearingSlaCount,
      }),
      ...config,
    },
  });
};

export default useBPAInbox;
