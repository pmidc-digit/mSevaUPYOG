import React, { useState, useEffect } from "react";
import { TextInput, LinkButton } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const NOCDocumentChecklist = ({ documents, applicationNo, tenantId, onRemarksChange, readOnly = false }) => {
  const { t } = useTranslation();
  const [localRemarks, setLocalRemarks] = useState({});

  // fetch urls and checklist data as before...
  const { data: urlsList } = Digit.Hooks.noc.useNOCDocumentSearch(
    { value: { workflowDocs: (documents || []).map(d => ({ documentUid: d.documentUid })) } },
    { enabled: documents?.length > 0 }
  );
  const { data: searchChecklistData } = Digit.Hooks.noc.useNOCCheckListSearch({ applicationNo }, tenantId);

  useEffect(() => {
    if (searchChecklistData?.checkList?.length > 0 && Object.keys(localRemarks).length === 0) {
      const initial = {};
      searchChecklistData.checkList.forEach(c => { initial[c.documentUid || c.documentuid]  = c.remarks || ""; });
      setLocalRemarks(initial);
      onRemarksChange(initial);
    }
  }, [searchChecklistData]);

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
                  <TextInput
                    t={t}
                    type="text"
                    value={localRemarks[doc.documentUid] ?? ""}
                    onChange={(e) => !readOnly && setLocalRemarks(prev => ({ ...prev, [doc.documentUid]: e.target.value }))}
                    onBlur={(e) => !readOnly && handleBlur(doc.documentUid, e.target.value)}
                    disabled={readOnly}
                    className="checklist-table-input"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NOCDocumentChecklist;
