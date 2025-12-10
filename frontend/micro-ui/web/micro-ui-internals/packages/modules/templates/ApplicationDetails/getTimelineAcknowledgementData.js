/**
 * Transforms timeline/workflow data into a format suitable for PDF generation.
 * Follows the same pattern as OBPS getAcknowledgementData.
 */

const getTimelineAcknowledgementData = (workflowDetails, tenantInfo, t) => {
  const timeline = workflowDetails?.data?.timeline || workflowDetails?.timeline || [];
  const processInstances = workflowDetails?.data?.processInstances || workflowDetails?.processInstances || [];
  
  // Get business ID from process instances
  const businessId = processInstances?.[0]?.businessId || "N/A";
  const businessService = processInstances?.[0]?.businessService || "N/A";
  const moduleName = processInstances?.[0]?.moduleName || "N/A";

  // Transform timeline entries into table rows
  const timelineRows = timeline.map((item, index) => {
    const createdDate = item?.auditDetails?.created || "N/A";
    const timing = item?.auditDetails?.timing || "N/A";
    const assignerName = item?.assigner?.name || "N/A";
    const assignerType = item?.assigner?.type || "N/A";
    const mobileNumber = item?.assigner?.mobileNumber || "N/A";
    const action = item?.performedAction || "N/A";
    const status = item?.status || item?.state || "N/A";
    const comment = item?.wfComment?.[0] || "-";

    return {
      sNo: timeline.length - index, // Reverse order (latest first becomes 1)
      action: t ? t(action) : action,
      status: t ? t(status) : status,
      assignerName,
      assignerType,
      mobileNumber,
      date: createdDate,
      time: timing,
      comment,
    };
  });

  // Reverse to show chronological order (oldest first)
  const chronologicalRows = [...timelineRows].reverse();

  return {
    t,
    tenantId: tenantInfo?.code || "",
    name: t ? t("TIMELINE_PDF_TITLE") : "Application Timeline",
    heading: t ? t("TIMELINE_PDF_HEADING") : "Workflow Timeline Report",
    businessId,
    businessService: t ? t(`CS_COMMON_${businessService?.toUpperCase()}`) : businessService,
    moduleName,
    currentStatus: timeline?.[0]?.status || timeline?.[0]?.state || "N/A",
    generatedDate: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    timelineRows: chronologicalRows,
    tableHeaders: [
      { label: t ? t("CM_TIMELINE_SL_NO") : "S.No", key: "sNo" },
      { label: t ? t("CM_TIMELINE_ACTION_TAKEN") : "Action", key: "action" },
      { label: t ? t("CM_TIMELINE_STATUS") : "Status", key: "status" },
      { label: t ? t("CM_TIMELINE_NAME") : "Performed By", key: "assignerName" },
      { label: t ? t("CM_TIMELINE_USER_TYPE") : "User Type", key: "assignerType" },
      { label: t ? t("CM_TIMELINE_MOBILE") : "Mobile", key: "mobileNumber" },
      { label: t ? t("CM_TIMELINE_DATE") : "Date", key: "date" },
      { label: t ? t("CM_TIMELINE_TIME") : "Time", key: "time" },
      { label: t ? t("CM_TIMELINE_REMARKS") : "Remarks", key: "comment" },
    ],
  };
};

export default getTimelineAcknowledgementData;
