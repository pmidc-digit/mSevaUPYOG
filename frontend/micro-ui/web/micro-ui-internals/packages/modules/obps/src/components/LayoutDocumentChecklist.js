import React, { useState, useEffect } from "react";
import { TextArea, LinkButton } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const LayoutDocumentChecklist = ({ documents, applicationNo, tenantId, onRemarksChange, readOnly = false }) => {
  const { t } = useTranslation();
  const [localRemarks, setLocalRemarks] = useState({});

  // Debug: Log readOnly status - handle both string and boolean
  const isReadOnly = readOnly === true || readOnly === "true";
  console.log("LayoutDocumentChecklist - readOnly prop:", readOnly, "isReadOnly:", isReadOnly);

  // fetch urls
  const { data: urlsList } = Digit.Hooks.obps.useLayoutDocumentSearch(
    
    { value: { workflowDocs: (documents || []).map(d => ({ documentUid: d.documentUid })) } },
    { enabled: documents?.length > 0 }
  );

  console.log(urlsList, "USER LIST");

  // Initialize remarks for each document
  useEffect(() => {
    if (documents?.length > 0 && Object.keys(localRemarks).length === 0) {
      const initial = {};
      documents.forEach(d => { 
        initial[d.documentUid || d.uuid] = d.remarks || ""; 
      });
      console.log("DEBUG LayoutDocumentChecklist: Initializing remarks:", initial);
      console.log("DEBUG LayoutDocumentChecklist: Document details:", documents.map(d => ({ documentType: d.documentType, remarks: d.remarks, uuid: d.uuid })));
      setLocalRemarks(initial);
      onRemarksChange(initial);
    }
  }, [documents]);

  const handleBlur = (uid, value) => {
    const updated = { ...localRemarks, [uid]: value };
    setLocalRemarks(updated);
    onRemarksChange(updated);
  };

  return (
    <div className="checklist-document-table-wrapper">
      <table className="customTable table-border-style checklist-document-table">
        <thead>
          <tr>
            <th className="checklist-table-header checklist-table-header-srno">{t("SR_NO")}</th>
            <th className="checklist-table-header checklist-table-header-doc-name">{t("BPA_DOCUMENT_NAME")}</th>
            <th className="checklist-table-header checklist-table-header-doc-file">{t("BPA_DOCUMENT_FILE")}</th>
            <th className="checklist-table-header checklist-table-header-remark">{t("BPA_DOCUMENT_REMARK")}</th>
          </tr>
        </thead>
        <tbody>
          {documents?.map((doc, i) => {
            const url = urlsList?.pdfFiles?.[doc.documentUid] || doc.fileUrl;
            return (
              <tr key={doc.documentUid || i}>
                 <td className="checklist-table-cell checklist-table-cell-srno">{i + 1}</td>
                <td className="checklist-table-cell checklist-table-cell-doc-name">{t(doc?.documentType?.replaceAll(".", "_")) || t("CS_NA")}</td>
                <td className="checklist-table-cell checklist-table-cell-file">
                  {url ? (
                    <LinkButton label={t("View")} onClick={() => window.open(url, "_blank")} />
                  ) : t("CS_NA")}
                </td>
                <td className="checklist-table-cell checklist-table-cell-remark">
                  {isReadOnly ? (
                    <TextArea
                      t={t}
                      value={localRemarks[doc.documentUid] ?? ""}
                      disabled={true}
                      className="checklist-table-textarea"
                    />
                  ) : (
                    <TextArea
                      t={t}
                      value={localRemarks[doc.documentUid] ?? ""}
                      onChange={(e) => {
                        console.log("onChange triggered - value:", e.target.value);
                        setLocalRemarks(prev => ({ ...prev, [doc.documentUid]: e.target.value }));
                      }}
                      onBlur={(e) => {
                        console.log("onBlur triggered - final value:", e.target.value);
                        handleBlur(doc.documentUid, e.target.value);
                      }}
                      className="checklist-table-textarea"
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LayoutDocumentChecklist;
