import React, { useState, useEffect } from "react";
import { TextInput, LinkButton, TextArea } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const CLUDocumentChecklist = ({ documents, applicationNo, tenantId, onRemarksChange, readOnly = false }) => {
  const { t } = useTranslation();
  const [localRemarks, setLocalRemarks] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // fetch urls and checklist data as before...
  const { data: urlsList } = Digit.Hooks.noc.useNOCDocumentSearch(
    { value: { workflowDocs: (documents || []).map(d => ({ documentUid: d.documentUid })) } },
    { enabled: documents?.length > 0 }
  );
  const { data: searchChecklistData } = Digit.Hooks.obps.useCLUCheckListSearch({ applicationNo }, tenantId);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (searchChecklistData?.checkList?.length > 0 && Object.keys(localRemarks).length === 0) {
      const initial = {};
      searchChecklistData.checkList.forEach(c => { initial[c.documentuid] = c.remarks || ""; });
      setLocalRemarks(initial);
      onRemarksChange(initial);
    }
  }, [searchChecklistData]);

  const handleRemarkChange = (uid, value) => {
    const updated = { ...localRemarks, [uid]: value };
    setLocalRemarks(updated);
    onRemarksChange(updated);
  };

  const renderMobileCardView = () => {
    return (
      <div className="checklist-mobile-cards">
        {documents?.map((doc, i) => {
          const url = urlsList?.pdfFiles?.[doc.documentUid] || doc.fileUrl;
          return (
            <div key={doc.documentUid || i} className="checklist-mobile-card">
              <div className="checklist-card-header">
                <span className="checklist-card-sr-no">{i + 1}</span>
                <span className="checklist-card-doc-name">{t(doc?.documentType?.replaceAll(".", "_")) || t("CS_NA")}</span>
              </div>
              <div className="checklist-card-content">
                <div className="checklist-card-row">
                  <label className="checklist-card-label">{t("BPA_DOCUMENT_FILE")}</label>
                  {url ? (
                    <LinkButton label={t("View")} onClick={() => window.open(url, "_blank")} />
                  ) : (
                    <span>{t("CS_NA")}</span>
                  )}
                </div>
                <div className="checklist-card-row">
                  <label className="checklist-card-label">{t("BPA_REMARKS_LABEL")}</label>
                  {readOnly ? (
                    <div className="checklist-card-remark">
                      {localRemarks[doc.documentUid] || <TextArea placeholder="Enter remarks" disabled={true} className="checklist-table-textarea" />}
                    </div>
                  ) : (
                    <TextArea
                      value={localRemarks[doc.documentUid] ?? ""}
                      onChange={(e) => handleRemarkChange(doc.documentUid, e.target.value)}
                      disabled={false}
                      className="checklist-table-textarea"
                      placeholder="Enter remarks"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <React.Fragment>
      {isMobile ? (
        renderMobileCardView()
      ) : (
        <div className="checklist-document-table-wrapper">
          <table className="customTable table-border-style checklist-document-table">
            <thead>
              <tr>
                <th className="checklist-table-header checklist-table-header-srno">{t("BPA_SR_NO_LABEL")}</th>
                <th className="checklist-table-header checklist-table-header-doc-name">{t("BPA_DOCUMENT_NAME")}</th>
                <th className="checklist-table-header checklist-table-header-doc-file">{t("BPA_DOCUMENT_FILE")}</th>
                <th className="checklist-table-header checklist-table-header-remark">{t("BPA_REMARKS_LABEL")}</th>
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
                      {readOnly ? (
                        <div className="checklist-remark-display">
                          {localRemarks[doc.documentUid] || <TextArea placeholder="Enter remarks" disabled={true} className="checklist-table-textarea" />}
                        </div>
                      ) : (
                        <TextArea
                          value={localRemarks[doc.documentUid] ?? ""}
                          onChange={(e) => handleRemarkChange(doc.documentUid, e.target.value)}
                          disabled={false}
                          className="checklist-table-textarea"
                          placeholder="Enter remarks"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </React.Fragment>
  );
};

export default CLUDocumentChecklist;
