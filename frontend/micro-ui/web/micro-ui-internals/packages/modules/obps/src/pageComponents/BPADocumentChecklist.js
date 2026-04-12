import React, { useState, useEffect } from "react";
import { TextInput, LinkButton, TextArea } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const BPADocumentChecklist = ({ documents, applicationNo, tenantId, onRemarksChange, readOnly = false }) => {
  const { t } = useTranslation();
  const [localRemarks, setLocalRemarks] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const sortedDocuments = [...(documents || [])].sort((a, b) => {
    if (!a?.order) return 1;
    if (!b?.order) return -1;
    return a.order - b.order;
  })?.filter(doc => !!doc.fileURL); // Filter out documents without a fileURL


  // fetch urls and checklist data as before...
  const { data: searchChecklistData } = Digit.Hooks.obps.useBPACheckListSearch({ applicationNo }, tenantId);

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
      searchChecklistData.checkList.forEach((c) => {
        initial[c.documentuid] = c.remarks || "";
      });
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
        {sortedDocuments?.map((doc, i) => {
          const url = doc.fileURL;
          return (
            <div key={doc.id || i} className="checklist-mobile-card">
              <div className="checklist-card-header">
                <span className="checklist-card-sr-no">{i + 1}</span>
                <span className="checklist-card-doc-name">{t(doc?.documentType?.replaceAll(".", "_")) || t("CS_NA")}</span>
              </div>
              <div className="checklist-card-content">
                <div className="checklist-card-row">
                  <label className="checklist-card-label">{t("BPA_DOCUMENT_FILE")}</label>
                  {url ? <LinkButton label={t("View")} onClick={() => window.open(url, "_blank")} /> : <span>{t("CS_NA")}</span>}
                </div>
                <div className="checklist-card-row">
                  <label className="checklist-card-label">{t("BPA_REMARKS_LABEL")}</label>
                  {readOnly ? (
                    <div className="checklist-card-remark">
                      {localRemarks[doc.id] || <TextArea placeholder="Enter remarks" disabled={true} className="checklist-table-textarea" value={localRemarks[doc.id] || ""} />}
                    </div>
                  ) : (
                    <TextArea
                      value={localRemarks[doc.id] || ""}
                      onChange={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                        handleRemarkChange(doc.id, e.target.value);
                      }}
                      disabled={false}
                      className="checklist-table-textarea"
                      placeholder="Enter remarks"
                      style={{ overflow: "hidden" }}
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
              {sortedDocuments?.map((doc, i) => {
                const url = doc.fileURL;
                return (
                  <tr key={doc.id || i}>
                    <td className="checklist-table-cell checklist-table-cell-srno">{i + 1}</td>
                    <td className="checklist-table-cell checklist-table-cell-doc-name">{t(doc?.documentType?.replaceAll(".", "_")) || t("CS_NA")}</td>
                    <td className="checklist-table-cell checklist-table-cell-file">
                      {url ? <LinkButton label={t("View")} onClick={() => window.open(url, "_blank")} /> : t("CS_NA")}
                    </td>
                    <td className="checklist-table-cell checklist-table-cell-remark">
                      {readOnly ? (
                        <div className="checklist-remark-display">
                          {localRemarks[doc?.id] || (
                            <TextArea placeholder="Enter remarks" disabled={true} className="checklist-table-textarea" value={localRemarks[doc?.id] || ""} />
                          )}
                        </div>
                      ) : (
                        <TextArea
                          value={localRemarks[doc?.id] || ""}
                          onChange={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                            handleRemarkChange(doc.id, e.target.value);
                          }}
                          disabled={false}
                          className="checklist-table-textarea"
                          placeholder="Enter remarks"
                          style={{ overflow: "hidden" }}
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

export default BPADocumentChecklist;
