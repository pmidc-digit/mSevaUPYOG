import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@mseva/digit-ui-react-components";

const PDFSvg = React.memo(({ width = 20, height = 20, style }) => (
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
    <div style={{ display: "inline-block", marginRight: "10px" }}>
      {documents?.map((document, idx) => {
        const documentLink = pdfDownloadLink(data?.pdfFiles, document?.fileStoreId);
        if (!documentLink) return null;
        return (
          <a
            key={idx}
            target="_blank"
            rel="noopener noreferrer"
            href={documentLink}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#2563eb", textDecoration: "none" }}
          >
            <PDFSvg />
            <span style={{ fontSize: "14px", fontWeight: "600" }}>{document?.fileName || "Document"}</span>
          </a>
        );
      })}
    </div>
  );
});

export default function NewApplicationTimeline({ workflowDetails, t }) {
  const normalizeTimeline = (workflowDetails) => {
    // Handle both formats: { data: { timeline: [...] } } and { timeline: [...] }
    const details = workflowDetails?.data || workflowDetails;
    const rawTimeline = details?.timeline;

    if (!rawTimeline || !Array.isArray(rawTimeline)) return [];

    return rawTimeline?.map((item) => {
      // Use logic similar to ApplicationTimeline parseDate
      let dateObj = null;
      const dateStr = item?.auditDetails?.lastModified || item?.auditDetails?.created;
      if (dateStr) {
        if (typeof dateStr === "string" && dateStr?.includes("/")) {
          const [day, month, year] = dateStr?.split("/");
          dateObj = new Date(year, month - 1, day);
        } else {
          dateObj = new Date(dateStr);
        }
      }

      const createdDate = dateObj ? dateObj?.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "N/A";
      const createdTime = dateObj ? dateObj?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

      return {
        ...item,
        auditDetails: {
          ...item?.auditDetails,
          created: createdDate,
          timing: createdTime,
        },
        status: item?.state,
        performedAction: item?.performedAction,
        assignes: item?.assignes ? item?.assignes : item?.assigner ? [item?.assigner] : [],
        wfComment: item?.wfComment || (item?.comment ? [item?.comment] : []),
        wfDocuments: item?.wfDocuments || [],
      };
    });
  };

  const data = useMemo(() => normalizeTimeline(workflowDetails), [workflowDetails]);
  // Assuming data is latest first, we don't reverse.
  const sortedData = data || [];
  console.log("sortedData", sortedData);

  return (
    <React.Fragment>
      <div className="custom-timeline-container">
        <div className="custom-timeline-header">
          <div className="custom-tracking-status-header">
            <div className="custom-tracking-line"></div>
            <span className="custom-tracking-status-text">TRACKING STATUS</span>
            <div className="custom-tracking-line"></div>
          </div>
          <div className="custom-title-bar-row">
            <h2 className="custom-timeline-title">Application History</h2>
            <div className="custom-blue-bar"></div>
          </div>
        </div>

        <div className="custom-timeline-entries">
          {sortedData?.map((item, index) => (
            <div key={index} className="custom-timeline-entry">
              <div className="custom-vertical-line"></div>

              {/* Date badge */}
              <div className="custom-date-badge">
                {item?.auditDetails?.created} {item?.auditDetails?.timing}
              </div>

              {/* Main timeline entry container */}
              <div className="custom-entry-content">
                {/* Left side: circular icon on vertical line */}
                <div className="custom-icon-container">
                  <div className="custom-circular-icon">
                    <svg className="custom-mail-icon" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </div>
                </div>

                {/* Right side: content card */}
                <div className="custom-content-card">
                  <div className="custom-card-top">
                    <div className="custom-card-left">
                      <h3 className="custom-action-title">Action taken by</h3>
                      {item?.assignes && item?.assignes?.length > 0 && (
                        <div className="custom-officer-info">
                          <div className="custom-officer-name">{item?.assignes?.[0]?.name || t("CS_COMMON_NA")}</div>
                          {item?.assignes?.[0]?.emailId && (
                            <div className="custom-officer-email">
                              <span className="custom-email-label">Email:</span> {item?.assignes?.[0]?.emailId}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="custom-card-right">
                      <div className="custom-actions-label">Action</div>
                      <div className="custom-status-text">{t(item?.performedAction || "CS_COMMON_NA")}</div>
                    </div>
                  </div>

                  {item?.wfComment && item?.wfComment?.length > 0 && item?.wfComment?.some((c) => c?.trim()) && (
                    <div className="custom-comments-section">
                      <h4 className="custom-comments-title">Officer Comments</h4>
                      <div className="custom-comment-text">
                        {item?.wfComment?.map((comment, idx) => (
                          <p key={idx}>{comment}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {item?.wfDocuments && item?.wfDocuments?.length > 0 && (
                    <div className="custom-comments-section" style={{ borderTop: "none", paddingTop: "0" }}>
                      <h4 className="custom-comments-title">Document Attached:</h4>
                      <div className="custom-comment-text">
                        {item?.wfDocuments?.map((doc, index) => (
                          <TimelineDocument key={`${doc?.documentType}-${index}`} value={item?.wfDocuments} Code={doc?.documentType} index={index} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}
