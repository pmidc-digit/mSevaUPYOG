import React from "react";
import { useTranslation } from "react-i18next";
import { CardText, Loader, PDFSvg } from "@mseva/digit-ui-react-components";
import { pdfDownloadLink, stringReplaceAll } from "../utils";

/**
 * OBPSDocument
 *
 * Props:
 *  - value: object (document container)
 *  - Code: string (document type code)
 *  - index: number
 *  - isNOC: boolean
 *  - svgStyles: object (unused in tableSafe mode, used in preview mode)
 *  - isStakeHolder: boolean
 *  - tableSafe: boolean  <-- IMPORTANT: set this to true when using inside a <td>
 */
function BPADocuments({
  value = {},
  Code,
  index,
  isNOC = false,
  svgStyles = { width: "100px", height: "100px", viewBox: "0 0 25 25", minWidth: "100px" },
  isStakeHolder = false,
  tableSafe = false,
}) {
  const { t } = useTranslation();

  const { isLoading, isError, error, data } = Digit.Hooks.obps.useOBPSDocumentSearch(
    { value },
    { value },
    Code,
    index,
    isNOC
  );

  // Build matched documents array (same logic as your original)
  let documents = [];
  if (isNOC) {
    const nocDocs = value?.nocDocuments?.nocDocuments || value || [];
    documents = Array.isArray(nocDocs)
      ? nocDocs.filter((ob) => ob?.documentType?.includes(Code))
      : [];
  } else {
    const docs = value?.documents?.documents || (Array.isArray(value) ? value : []);
    documents = Array.isArray(docs)
      ? docs.filter((doc) => doc?.documentType === Code)
      : [];
  }

  if (isLoading) {
    return <Loader />;
  }

  // Table-safe mode: return a single inline element only (no extra divs)
  if (tableSafe) {
    if (!documents || documents.length === 0) {
      // Single element (text) to keep table alignment
      return <span style={{ color: "#505A5F" }}>{t("BPA_NO_DOCUMENTS_UPLOADED_LABEL")}</span>;
    }

    // Use single inline span (no nested block-level elements)
    const label = isStakeHolder
      ? t(`BPAREG_HEADER_${stringReplaceAll(Code?.toUpperCase(), ".", "_")}`)
      : t(Code);

    return <span style={{ color: "#333" }}>{label}</span>;
  }

  // Non-table (detailed) mode: render clickable icons / links (original behaviour)
  if (!documents || documents.length === 0) {
    return <CardText>{t("BPA_NO_DOCUMENTS_UPLOADED_LABEL")}</CardText>;
  }

  return (
    <React.Fragment>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
        {documents.map((document, idx) => {
          const documentLink = pdfDownloadLink(data?.pdfFiles, document?.fileStoreId) || "#";
          const displayName = document?.fileName
            ? document.fileName
            : isStakeHolder
            ? t(`BPAREG_HEADER_${stringReplaceAll(Code?.toUpperCase(), ".", "_")}`)
            : t(Code);

          return (
            <a
              key={idx}
              href={documentLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textDecoration: "none",
               
                marginRight: "10px",
                color: "#505A5F",
              }}
            >
         

              {/* File name / label */}
              <span
                style={{
                  marginTop: "8px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#505A5F",
                  wordBreak: "break-word",
                }}
                title={displayName}
              >
                {displayName}
              </span>
            </a>
          );
        })}
      </div>
    </React.Fragment>
  );
}

export default BPADocuments;
