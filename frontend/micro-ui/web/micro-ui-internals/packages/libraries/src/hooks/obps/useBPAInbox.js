import { useEffect } from "react";
import { OBPS_BPA_BUSINESS_SERVICES, OBPS_BPA_OC_BUSINESS_SERVICES } from "../../../../constants/constants";
import useInbox from "../useInbox";
import { useTranslation } from "react-i18next";

const useBPAInbox = ({ tenantId, filters, config = {} }) => {
  const { filterForm, searchForm, tableForm } = filters;
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const stateId = Digit.ULBService.getStateId();
  const { data: holidayList, isLoading: isHolidayListLoading } = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "Holidays" }]);
  let { moduleName, businessService, applicationStatus, locality, assignee, applicationType, licenseType } = filterForm;
  const { mobileNumber, applicationNo } = searchForm;
  const { sortBy, limit, offset, sortOrder } = tableForm;

  // const checkCitizenView = window.location.href.includes("citizen-bpa");

  const checkCitizenView = ["citizen-bpa", "citizen-stakeholder-inbox", "citizen-others"]?.some((path) => window.location.href.includes(path));

  // Parse holidays from the MDMS data into a Set for quick lookup
  const holidaysSet = new Set();
  if (holidayList?.["common-masters"]?.Holidays) {
    holidayList["common-masters"].Holidays.forEach((yearData) => {
      yearData.months.forEach((monthData) => {
        monthData.holidays.forEach((dayOfMonth) => {
          // Create a date key for quick lookup (YYYY-MM-DD)
          const dateKey = `${yearData.year}-${String(monthData.month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`;
          holidaysSet.add(dateKey);
        });
      });
    });
  }
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
    businessService = OBPS_BPA_OC_BUSINESS_SERVICES;
  } else if (
    applicationType !== "BUILDING_OC_PLAN_SCRUTINY" &&
    (window.location.href.includes("obps/inbox") || window.location.href.includes("obps/bpa/inbox")) &&
    !businessService
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
            ? typeof businessService === "string"
              ? [businessService]
              : [...businessService]
            : OBPS_BPA_BUSINESS_SERVICES
          : licenseType && licenseType.filter((item) => item).length > 0
          ? licenseType.filter((item) => item)
          : businessService
          ? [businessService.identifier]
          : // ? [businessService]
            ["ARCHITECT", "ENGINEER", "TOWNPLANNER", "SUPERVISOR", "ARCHITECT_UPGRADE", "BPAREG_UPGRADE"],
      // : ["ARCHITECT", "BUILDER", "ENGINEER", "STRUCTURALENGINEER", "TOWNPLANNER", "SUPERVISOR"],
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
    },
    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber } : {}),
      ...(!applicationNumber ? (applicationNo ? { applicationNo } : {}) : applicationNumber ? { applicationNumber } : {}),
      ...(applicationNumber ? { applicationNumber } : {}),
      ...(sortOrder ? { sortOrder } : {}),
      ...(sortBy ? { sortBy } : {}),
      isCitizenView: checkCitizenView,
      // ...(applicationType?.length > 0 ? {applicationType: applicationType.map((item) => item.code).join(",")} : {}),
      ...(applicationType && applicationType?.length > 0 ? { applicationType } : {}),
      ...(locality?.length > 0 ? { locality: locality.map((item) => item.code.split("_").pop()).join(",") } : {}),
    },
    limit,
  };

  if (!applicationNo) {
    _filters = { ..._filters, offset };
  }

  // Calculate business days (weekdays only, excluding holidays) between two timestamps
  const getBusinessDaysSinceCreated = (startTime, endTime) => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    let count = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // 0 = Sunday, 6 = Saturday - skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Convert to YYYY-MM-DD format and check if it's a holiday
        const dateKey = currentDate.toISOString().split("T")[0];
        // Only count if it's not a holiday
        if (!holidaysSet.has(dateKey)) {
          count++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  };

  const getDaysSinceCreated = (createdTime, approvedDate) => {
    if (!createdTime) return "NA";

    // If application is approved (approvedDate is not 0 and not null)
    if (approvedDate && approvedDate !== 0) {
      return getBusinessDaysSinceCreated(createdTime, approvedDate);
    }

    // If application is not approved yet, calculate from createdTime to today
    const today = Date.now(); // current time in epoch (ms)
    return getBusinessDaysSinceCreated(createdTime, today);
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
          // submissionDate: application?.ProcessInstance?.auditDetails?.lastModifiedTime,
          submissionDate: application?.businessObject?.applicationDate,
          createdDate: application.businessObject.auditDetails.createdTime,
          approvalDate: application.businessObject.approvalDate,
          businessService: application?.ProcessInstance?.businessService,
          applicationType: application?.businessObject?.additionalDetails?.applicationType
            ? `WF_BPA_${application?.businessObject?.additionalDetails?.applicationType}`
            : "-",
          locality: application.businessObject?.landInfo?.address?.locality?.code
            ? `${application.businessObject?.tenantId
                ?.toUpperCase()
                ?.split(".")
                ?.join("_")}_REVENUE_${application.businessObject?.landInfo?.address?.locality?.code?.toUpperCase()}`
            : "NA",
          status: application?.ProcessInstance?.state?.state,
          state: application?.ProcessInstance?.state?.state,
          owner: application?.businessObject?.landInfo?.owners?.find((item) => item?.isPrimaryOwner)?.name || "NA",
          mobileNumber: application?.businessObject?.tradeLicenseDetail?.owners?.[0]?.mobileNumber || "NA",
          // sla: application?.businessObject?.status.match(/^(APPROVED)$/)
          //   ? getDaysSinceCreated(application?.businessObject?.applicationDate, application?.businessObject?.approvalDate)
          //   : getDaysSinceCreated(application?.businessObject?.applicationDate),
          sla: getDaysSinceCreated(application?.businessObject?.applicationDate, application?.businessObject?.approvalDate),
          assignedOwner: application?.ProcessInstance?.assignes?.[0]?.name || t("DOCUMENT_VERIFIER"),
          category: application.businessObject?.additionalDetails?.categoriesName,
          zone: application.businessObject?.additionalDetails?.zonenumber,
          selfCertification: application.businessObject?.additionalDetails?.isSelfCertification ? "Yes" : "No",
          tenantId: application.businessObject?.tenantId,
        })),
        totalCount: data.totalCount,
        nearingSlaCount: data?.nearingSlaCount,
      }),
      ...config,
    },
  });
};

export default useBPAInbox;
