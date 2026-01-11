import React from "react";
import {
  TextInput,
  CardSubHeader,
} from "@mseva/digit-ui-react-components";
import NOCCustomUploadFile from "./NOCCustomUploadFile";

export const NOCFeeTable = ({
  feeDataWithTotal,
  disable,
  isEmployee,
  feeData,
  handleAdjustedAmountChange,
  handleFileUpload,
  handleFileDelete,
  routeTo,
  t,
  handleRemarkChange,
  onAdjustedAmountBlur
}) => {
  console.log('feeDataWithTotal in fee table rn', feeDataWithTotal)
  return (
    <div className="noc-table-container">
      <table className="customTable table-border-style">
        <thead>
          <tr>
            <th>{t("BPA_TAXHEAD_CODE")}</th>
            <th>{t("BPA_AMOUNT")}</th>
            <th>{t("BPA_ADJUSTED_AMOUNT")}</th>
            <th>{t("BPA_FILE_UPLOAD")}</th>
            <th>{t("BPA_REMARKS")}</th>
          </tr>
        </thead>
        <tbody>
          {feeDataWithTotal.map(
            (row, i) => (
              (
                <tr key={row.index || i}>
                  <td>{t(row.title) || t("CS_NA")}</td>
                  <td>{row.amount !== null && row.amount !== undefined ? `₹ ${row.amount.toLocaleString()}` : t("CS_NA")}</td>
                  <td>
                    {row?.taxHeadCode === "NOC_TOTAL" ? (
                      ""
                    ) : (
                      <TextInput
                        t={t}
                        type="number"
                        isMandatory={false}
                        value={feeData[row.index]?.adjustedAmount ?? ""}
                        onChange={(e) => handleAdjustedAmountChange(row.index, e.target.value, row.amount)}
                        // ❌ no onBlur here for NOC
                        disable={disable}
                        step={1}
                        onBlur={onAdjustedAmountBlur}
                      />
                    )}
                  </td>
                  <td>
                    {row?.taxHeadCode === "NOC_TOTAL" ? null : (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <NOCCustomUploadFile
                          key={row.index}
                          id={`file-${row.id}`}
                          onUpload={(file) => handleFileUpload(row.index, file || null)}
                          onDelete={() => handleFileDelete(row.index)}
                          message={row.filestoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                          uploadedFile={row.filestoreId}
                          disabled={disable}
                        />
                      </div>
                    )}
                  </td>

                  <td>
                    {row?.taxHeadCode === "NOC_TOTAL" ? (
                      ""
                    ) : (
                      <TextInput
                        t={t}
                        type="text"
                        isMandatory={true}
                        value={feeData[row.index]?.remark || ""}
                        onChange={(e) => handleRemarkChange(row.index, e.target.value, row.amount)}
                        disable={disable}
                        style={{
                          width: "100%",
                          padding: "4px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
};
