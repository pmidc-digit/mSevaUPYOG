export const getHolidaysSet = (holidayList) => {
  const holidaysSet = new Set();

  holidayList?.["common-masters"]?.Holidays?.forEach((yearData) => {
    yearData?.months?.forEach((monthData) => {
      monthData?.holidays?.forEach((dayOfMonth) => {
        holidaysSet.add(`${yearData.year}-${String(monthData.month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`);
      });
    });
  });

  return holidaysSet;
};

export const getDaysSinceCreated = (createdTime, approvedDate, holidaysSet = new Set()) => {
  if (!createdTime) return "NA";

  const currentDate = new Date(createdTime);
  const endDate = new Date(approvedDate || Date.now());
  let count = 0;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateKey = currentDate.toISOString().split("T")[0];

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaysSet.has(dateKey)) count += 1;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

const getBPAREGBusinessService = (license) => {
  const tradeType = license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0];

  return license?.businessService && license.businessService !== "BPAREG" ? license.businessService : tradeType || "ARCHITECT";
};

export const mapBPAREGLicenseToRow = (license, holidaysSet) => {
  const createdTime = license?.applicationDate || license?.auditDetails?.createdTime;
  const approvedDate = license?.status === "APPROVED" ? license?.issuedDate || license?.auditDetails?.lastModifiedTime : null;

  return {
    applicationId: license?.applicationNumber,
    createdDate: license?.auditDetails?.createdTime,
    submissionDate: createdTime,
    issuedDate: license?.issuedDate,
    tenantId: license?.tenantId,
    professionalOwner: license?.tradeLicenseDetail?.owners?.[0]?.name,
    state: license?.status,
    businessService: getBPAREGBusinessService(license),
    applicationType: license?.applicationType,
    architectID: license?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo,
    licenseNumber: license?.licenseNumber,
    sla: getDaysSinceCreated(createdTime, approvedDate, holidaysSet),
    _searchData: { businessObject: license },
  };
};

export const getBPAREGFallbackStatuses = (licenses = []) => {
  const statusGroups = licenses.reduce((groups, license) => {
    const status = license?.status || "UNKNOWN";

    if (!groups[status]) {
      groups[status] = { count: 0, businessService: getBPAREGBusinessService(license) };
    }

    groups[status].count += 1;
    return groups;
  }, {});

  return Object.entries(statusGroups).map(([status, { count, businessService }]) => ({
    applicationstatus: status,
    statusid: status,
    totalCount: count,
    count,
    businessService,
    businessservice: businessService,
  }));
};
