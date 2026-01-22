import React, { useState, useEffect } from "react";
import { TextInput, LinkButton } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const CLUDocumentChecklist = ({ documents, applicationNo, tenantId, onRemarksChange, readOnly = false }) => {
  const { t } = useTranslation();
  const [localRemarks, setLocalRemarks] = useState({});

  // fetch urls and checklist data as before...
  const { data: urlsList } = Digit.Hooks.noc.useNOCDocumentSearch(
    { value: { workflowDocs: (documents || []).map(d => ({ documentUid: d.documentUid })) } },
    { enabled: documents?.length > 0 }
  );
  const { data: searchChecklistData } = Digit.Hooks.obps.useCLUCheckListSearch({ applicationNo }, tenantId);

  useEffect(() => {
    if (searchChecklistData?.checkList?.length > 0 && Object.keys(localRemarks).length === 0) {
      const initial = {};
      searchChecklistData.checkList.forEach(c => { initial[c.documentuid] = c.remarks || ""; });
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
    <div className="noc-table-container">
      <table className="customTable table-border-style">
        <thead>
          <tr>
            <th>{t("BPA_SR_NO_LABEL")}</th>
            <th>{t("BPA_DOCUMENT_NAME")}</th>
            <th>{t("BPA_DOCUMENT_FILE")}</th>
            <th>{t("BPA_REMARKS_LABEL")}</th>
          </tr>
        </thead>
        <tbody>
          {documents?.map((doc, i) => {
            const url = urlsList?.pdfFiles?.[doc.documentUid] || doc.fileUrl;
            return (
              <tr key={doc.documentUid || i}>
                 <td>{i + 1}</td>
                <td>{t(doc?.documentType?.replaceAll(".", "_")) || t("CS_NA")}</td>
                <td>
                  {url ? (
                    <LinkButton label={t("View")} onClick={() => window.open(url, "_blank")} />
                  ) : t("CS_NA")}
                </td>
                <td>
                  <TextInput
                    t={t}
                    type="text"
                    value={localRemarks[doc.documentUid] ?? ""}
                    onChange={(e) => !readOnly && setLocalRemarks(prev => ({ ...prev, [doc.documentUid]: e.target.value }))}
                    onBlur={(e) => !readOnly && handleBlur(doc.documentUid, e.target.value)}
                    disabled={readOnly}
                    style={{ width: "100%", padding: "4px", border: "1px solid #ccc", borderRadius: "4px" }}
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

export default CLUDocumentChecklist;
