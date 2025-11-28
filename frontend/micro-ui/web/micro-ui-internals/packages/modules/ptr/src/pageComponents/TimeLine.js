/* ===== COMPONENT TEMPLATE ===== */
import React, { useEffect } from "react";
import { CheckPoint, ConnectingCheckPoints } from "@mseva/digit-ui-react-components";
import PTRWFDocument from "./PTRWFDocument";

/* ===== CSS CLASSES ===== */
const styles = `
.timeline-card {
  width: 100vw; /* full viewport width */
  max-width:85vw;
  margin-left: calc(-50vw + 50%); /* center it */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background: #fff;
  font-family: "Segoe UI", sans-serif;
}

.timeline-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap; /* keep all in one row */
  margin-bottom: 16px;
}

.timeline-header-item {
  display: flex;
  flex-direction: row; /* label and value inline */
  align-items: center;
  margin-right: 16px;
  white-space: nowrap; /* prevent line breaks */
}

.timeline-label {
  font-weight: 600;
  color: #444;
  margin-right: 6px;
}

.timeline-value {
  color: #222;
}

.timeline-note {
  margin: 16px 0;
}

.timeline-note .note-box {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
  min-height: 60px;
  background: #f9f9f9;
}

.timeline-docs {
  margin-top: 16px;
}
`;

/* ===== Utility: Calculate Days ===== */
const calculateDays = (start, end) => {
  if (!start || !end) return "N/A";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? "N/A" : diffDays === 0 ? "0 Days" : `${diffDays} Days`;
};

/* ===== Normalizer Utility ===== */
const normalizeTimeline = (workflowDetails) => {
  const rawTimeline = workflowDetails?.data?.timeline || [];
  return rawTimeline.map((item, index) => ({
    id: index,
    state: item.state,
    performedAction: item.performedAction,
    assignerName: item.assigner?.name || "N/A",
    comment: item.wfComment?.[0] || "",
    documents: item.wfDocuments || [],
    createdDate: item.auditDetails?.created || "",
    lastModified: item.auditDetails?.lastModified || "",
    noOfDays: calculateDays(item.auditDetails?.created, item.auditDetails?.lastModified),
  }));
};

/* ===== Caption Component ===== */
const TimelineCaption = ({ checkpoint, t }) => {
  return (
    <div className="timeline-card">
      {/* Header */}
      <div className="timeline-header">
        <div className="timeline-header-item">
          <span className="timeline-label">{t("Name")}:</span>
          <span className="timeline-value">{checkpoint.assignerName}</span>
        </div>
        <div className="timeline-header-item">
          <span className="timeline-label">{t("Action Taken")}:</span>
          <span className="timeline-value">{checkpoint.state}</span>
        </div>
        <div className="timeline-header-item">
          <span className="timeline-label">{t("Date Received")}:</span>
          <span className="timeline-value">{checkpoint.createdDate}</span>
        </div>
        <div className="timeline-header-item">
          <span className="timeline-label">{t("Action Taken On")}:</span>
          <span className="timeline-value">{checkpoint.lastModified}</span>
        </div>
        <div className="timeline-header-item">
          <span className="timeline-label">{t("No. of Days")}:</span>
          <span className="timeline-value">{checkpoint.noOfDays}</span>
        </div>
      </div>

      {/* Note */}
      <div className="timeline-note">
        <span className="timeline-label">{t("Note")}:</span>
        <div className="note-box">{checkpoint.comment || t("No comments")}</div>
      </div>

      {/* Documents */}
      {checkpoint.documents?.length > 0 && (
        <div className="timeline-docs">
          <span className="timeline-label">{t("Documents Attached")}:</span>
          {checkpoint.documents.map((doc, index) => (
            <PTRWFDocument
              key={index}
              value={checkpoint.documents}
              Code={doc?.documentType}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ===== Main Timeline Template ===== */
export const TimelineTemplate = ({ workflowDetails, businessService, t }) => {
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);
  }, []);

  const timeline = normalizeTimeline(workflowDetails);
  const currentState = workflowDetails?.data?.timeline?.[0]?.state;


  console.log('workflowDetails', workflowDetails)

  return (
    <React.Fragment>
      {timeline.length === 1 ? (
        <CheckPoint
          isCompleted={true}
          label={t(`${timeline[0].state}`)}
          customChild={<TimelineCaption checkpoint={timeline[0]} t={t} />}
        />
      ) : (
        <ConnectingCheckPoints>
          {timeline.map((checkpoint) => (
            <CheckPoint
              keyValue={checkpoint.id}
              isCompleted={checkpoint.state === currentState}
              label={t(`${checkpoint.state}`)}
              customChild={<TimelineCaption checkpoint={checkpoint} t={t} />}
            />
          ))}
        </ConnectingCheckPoints>
      )}
    </React.Fragment>
  );
};
