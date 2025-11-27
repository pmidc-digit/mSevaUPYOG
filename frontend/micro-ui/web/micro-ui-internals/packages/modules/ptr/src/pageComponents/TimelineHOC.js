import React, { useEffect } from "react";
import { CheckPoint, ConnectingCheckPoints, Loader } from "@mseva/digit-ui-react-components";

/* ===== CSS CLASSES ===== */
const styles = `
.timeline-hoc-container .checkpoint header,
.timeline-hoc-container .checkpoint-done header {
  flex: 1;
}

.timeline-card {
  width: 100%;
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
  font-weight: 500;
  color: #444;
  margin-right: 6px;
}

.timeline-value {
  color: #222;
  font-weight: 400;
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

    // Parse DD/MM/YYYY format
    const parseDate = (dateStr) => {
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
        }
        return new Date(dateStr);
    };

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "N/A";
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? "N/A" : diffDays === 0 ? "0 Days" : `${diffDays} Days`;
};

/* ===== Document Components ===== */
const PDFSvg = ({ width = 20, height = 20, style }) => (
    <svg style={style} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20" fill="gray">
        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
    </svg>
);

const pdfDownloadLink = (documents = {}, fileStoreId = "", format = "") => {
    let downloadLink = documents[fileStoreId] || "";
    let differentFormats = downloadLink?.split(",") || [];
    let fileURL = "";
    differentFormats.length > 0 &&
        differentFormats.map((link) => {
            if (!link.includes("large") && !link.includes("medium") && !link.includes("small")) {
                fileURL = link;
            }
        });
    return fileURL;
};

const TimelineDocument = ({ value = {}, Code, index }) => {
    const { isLoading, isError, error, data } = Digit.Hooks.ads.useADSDocumentSearch({ value }, { value }, Code, index);

    const documents = value?.documents
        ? value.documents.documents
            .filter((doc) => doc.documentType === Code)
            .map((doc) => ({ ...doc, documentType: doc.documentType.replace(/\./g, "_") }))
        : value.filter((doc) => doc.documentType === Code).map((doc) => ({ ...doc, documentType: doc.documentType.replace(/\./g, "_") }));

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div style={{ marginTop: "19px" }}>
            <React.Fragment>
                {data?.pdfFiles && (
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {documents?.map((document, index) => {
                            let documentLink = pdfDownloadLink(data.pdfFiles, document?.fileStoreId);
                            return (
                                <a target="_" href={documentLink} style={{ minWidth: "100px", marginRight: "10px" }} key={index}>
                                    <PDFSvg width={85} height={100} style={{ background: "#f6f6f6", padding: "8px" }} />
                                </a>
                            );
                        })}
                    </div>
                )}
            </React.Fragment>
        </div>
    );
};

/* ===== Normalizer Utility ===== */
const normalizeTimeline = (workflowDetails) => {
    const rawTimeline = workflowDetails?.data?.timeline || [];

    return rawTimeline.map((item, index) => {
        let createdDate = "N/A";
        let lastModified = "N/A";

        if (item.auditDetails?.created) {
            createdDate = item.auditDetails.created;
        }

        if (item.auditDetails?.lastModified) {
            lastModified = item.auditDetails.lastModified;
        }

        return {
            id: index,
            state: item.state,
            performedAction: item.performedAction,
            assignerName: item.assigner?.name || "N/A",
            comment: item.wfComment?.[0] || "",
            documents: item.wfDocuments || [],
            createdDate,
            lastModified,
            noOfDays: calculateDays(createdDate, lastModified),
        };
    });
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
                    <span className="timeline-label">{t("Action Taken On")}:</span>
                    <span className="timeline-value">{checkpoint.lastModified}</span>
                </div>
                <div className="timeline-header-item">
                    <span className="timeline-label">{t("Date Received")}:</span>
                    <span className="timeline-value">{checkpoint.createdDate}</span>
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
                        <TimelineDocument
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
export const TimelineHOC = ({ workflowDetails, t }) => {
    useEffect(() => {
        const styleTag = document.createElement("style");
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);
    }, []);

    const timeline = normalizeTimeline(workflowDetails);
    const currentState = workflowDetails?.data?.timeline?.[0]?.state;

    return (
        <div className="timeline-hoc-container">
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
                            key={checkpoint.id}
                            keyValue={checkpoint.id}
                            isCompleted={checkpoint.state === currentState}
                            label={t(`${checkpoint.state}`)}
                            customChild={<TimelineCaption checkpoint={checkpoint} t={t} />}
                        />
                    ))}
                </ConnectingCheckPoints>
            )}
        </div>
    );
};

export default TimelineHOC;
