import React, { useEffect, useMemo } from "react";
import { CheckPoint, ConnectingCheckPoints, Loader } from "@mseva/digit-ui-react-components";

/* ===== RESPONSIVE CSS ===== */
const styles = `
.timeline-hoc-container .checkpoint header,
.timeline-hoc-container .checkpoint-done header {
  flex: 1;
}

.timeline-card {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: clamp(12px, 3vw, 20px);
  margin: 10px 0;
  background: #fff;
  font-family: "Segoe UI", sans-serif;
}

.timeline-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.timeline-header-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.timeline-label {
  font-weight: 500;
  color: #0d43a7 !important;
  font-size: clamp(12px, 2vw, 14px);
}

.timeline-value {
 color: #0d43a7 !important;
  font-weight: 400;
  font-size: clamp(12px, 2vw, 14px);
}

.timeline-note {
  margin: 10px 0;
}

.timeline-note .note-box {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: clamp(12px, 2vw, 14px);
  min-height: 40px;
  background: #f9f9f9;
  word-break: break-word;
}

.timeline-docs {
  margin-top: 10px;
}

@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .timeline-header-item {
    width: 100%;
  }
  
  .timeline-card {
    padding: 12px;
  }


}
`;

/* ===== Optimized Date Parser ===== */
const parseDate = (dateStr) => {
  if (!dateStr || dateStr === "N/A") return null;
  if (typeof dateStr === "string" && dateStr?.includes("/")) {
    const [day, month, year] = dateStr?.split("/");
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
};

/* ===== Utility: Calculate Days ===== */
const calculateDays = (start, end) => {
  if (!start || !end) return "N/A";

  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate || !endDate || isNaN(startDate?.getTime()) || isNaN(endDate?.getTime())) {
    return "N/A";
  }

  const diffDays = Math.floor((endDate - startDate) / 86400000);
  return diffDays < 0 ? "N/A" : diffDays === 0 ? "0 Days" : `${diffDays} Days`;
};

/* ===== Document Components ===== */
const PDFSvg = React.memo(({ width = 85, height = 100, style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20" fill="gray">
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
  </svg>
));

const pdfDownloadLink = (documents, fileStoreId) => {
  const downloadLink = documents?.[fileStoreId] || "";
  const formats = downloadLink?.split(",")?.filter(Boolean) || [];
  return formats?.find((link) => !link?.includes("large") && !link?.includes("medium") && !link?.includes("small")) || formats?.[0] || "";
};

const TimelineDocument = React.memo(({ value, Code, index }) => {
  const { isLoading, data } = Digit.Hooks.ads.useADSDocumentSearch({ value }, { value }, Code, index);

  const documents = useMemo(() => {
    const docs = value?.documents ? value?.documents?.documents : value;
    return docs?.filter((doc) => doc?.documentType === Code) || [];
  }, [value, Code]);

  if (isLoading) return <Loader />;

  return (
    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {documents?.map((document, idx) => {
        const documentLink = pdfDownloadLink(data?.pdfFiles, document?.fileStoreId);
        if (!documentLink) return null;
        return (
          <a key={idx} target="_blank" rel="noopener noreferrer" href={documentLink} style={{ minWidth: "100px" }}>
            <PDFSvg style={{ background: "#f6f6f6", padding: "8px" }} />
          </a>
        );
      })}
    </div>
  );
});

/* ===== Optimized Normalizer ===== */
const normalizeTimeline = (workflowDetails) => {
  const rawTimeline = workflowDetails?.data?.timeline;
  if (!rawTimeline || !Array.isArray(rawTimeline)) return [];

  return rawTimeline?.map((item, index) => {
    const createdDate = item?.auditDetails?.created || "N/A";
    const lastModified = item?.auditDetails?.lastModified || "N/A";

    return {
      id: index,
      state: item?.state,
      assignerName: item?.assigner?.name || "N/A",
      performedAction: item?.performedAction,
      comment: item?.wfComment?.[0] || "",
      documents: item?.wfDocuments || [],
      createdDate,
      lastModified,
      noOfDays: calculateDays(createdDate, lastModified),
    };
  });
};

/* ===== Header Field Configuration ===== */
const HEADER_FIELDS = [
  { label: "CM_TIMELINE_NAME", key: "assignerName" },
  { label: "CM_TIMELINE_ACTION_TAKEN", key: "performedAction" },
  { label: "CM_TIMELINE_ACTION_TAKEN_ON", key: "lastModified" },
  { label: "CM_TIMELINE_DATE_RECEIVED", key: "createdDate" },
  { label: "CM_TIMELINE_NO_OF_DAYS", key: "noOfDays" },
];

/* ===== Memoized Caption Component ===== */
const TimelineCaption = React.memo(({ checkpoint, t }) => (
  <div className="timeline-card">
    <div className="timeline-header">
      {HEADER_FIELDS?.map(({ label, key }) => (
        <div key={key} className="timeline-header-item">
          <span className="timeline-label">{t(label)}:</span>
          <span className="timeline-value">{checkpoint?.[key] || "N/A"}</span>
        </div>
      ))}
    </div>

    <div className="timeline-note">
      <span className="timeline-label">{t("CM_TIMELINE_NOTE")}:</span>
      <div className="note-box">{checkpoint?.comment || t("CM_TIMELINE_NO_COMMENTS")}</div>
    </div>

    {checkpoint?.documents?.length > 0 && (
      <div className="timeline-docs">
        <span className="timeline-label">{t("CM_TIMELINE_DOCUMENT_ATTACHED")}:</span>
        {checkpoint?.documents?.map((doc, index) => (
          <TimelineDocument key={`${doc?.documentType}-${index}`} value={checkpoint?.documents} Code={doc?.documentType} index={index} />
        ))}
      </div>
    )}
  </div>
));

/* ===== Main Timeline Component ===== */
export const TimelineHOC = ({ workflowDetails, t }) => {
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    styleTag.setAttribute("data-timeline-hoc", "true");
    document.head.appendChild(styleTag);

    return () => {
      const tag = document.querySelector('[data-timeline-hoc="true"]');
      if (tag) tag?.remove();
    };
  }, []);

  // ✅ Normalize input: handle both { data: { timeline } } and { timeline }
  const details = workflowDetails?.data || workflowDetails;
  const timeline = useMemo(() => normalizeTimeline({ data: details }), [details]);
  const currentState = workflowDetails?.data?.timeline?.[0]?.state;

  if (!timeline?.length) return null;

  return (
    <div className="timeline-hoc-container">
      {timeline?.length === 1 ? (
        <CheckPoint isCompleted={true} label={t(timeline?.[0]?.state)} customChild={<TimelineCaption checkpoint={timeline?.[0]} t={t} />} />
      ) : (
        <ConnectingCheckPoints>
          {timeline?.map((checkpoint) => (
            <CheckPoint
              key={checkpoint?.id}
              keyValue={checkpoint?.id}
              isCompleted={checkpoint?.state === currentState}
              label={t(checkpoint?.state)}
              customChild={<TimelineCaption checkpoint={checkpoint} t={t} />}
            />
          ))}
        </ConnectingCheckPoints>
      )}
    </div>
  );
};

export default TimelineHOC;
