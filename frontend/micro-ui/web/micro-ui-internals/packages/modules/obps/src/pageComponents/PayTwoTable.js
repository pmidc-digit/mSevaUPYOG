import React from "react";
import {
    TextInput,
    Loader,
    LinkButton,
    CardSubHeader,
    UploadFile,
} from "@mseva/digit-ui-react-components";

export const PayTwoTable = ({
    sanctionFeeDataWithTotal,
    disable,
    isEmployee,
    sanctionFeeData,
    handleAdjustedAmountChange,
    onAdjustedAmountBlur,
    handleFileUpload,
    handleFileDelete,
    routeTo,
    t,
    handleRemarkChange
}) => {
    return (
        <div className="bpa-table-container">
            <CardSubHeader className="bpa-block-header" style={{ marginTop: "24px" }}>
                {t("BPA_SANCTION_FEE")}
            </CardSubHeader>

            <table className="customTable table-border-style">
                <thead>
                    <tr>
                        <th>{t("BPA_TAXHEAD_CODE")}</th>
                        <th>{t("BPA_AMOUNT")}</th>
                        <th>{t("BPA_ADJUSTED_AMOUNT")}</th>
                        {(disable || isEmployee) ? null : <th>{t("BPA_FILE_UPLOAD")}</th>}
                        <th>{t("BPA_VIEW_DOCUMENT")}</th>
                    </tr>
                </thead>
                <tbody>
                    {sanctionFeeDataWithTotal.map((row, i) => (
                        <tr key={row.index || i}>
                            <td>{row.title || t("CS_NA")}</td>
                            <td>
                                {row.amount !== null && row.amount !== undefined
                                    ? `₹ ${row.amount.toLocaleString()}`
                                    : t("CS_NA")}
                            </td>
                            <td>
                                {row?.taxHeadCode === "BPA_TOTAL" ? (
                                    row.adjustedAmount !== null && row.adjustedAmount !== undefined
                                        ? `₹ ${row.adjustedAmount.toLocaleString()}`
                                        : t("CS_NA")
                                ) : (
                                    <TextInput
                                        t={t}
                                        type="number"
                                        isMandatory={false}
                                        value={sanctionFeeData[row.index]?.adjustedAmount || ""}
                                        onChange={(e) =>
                                            handleAdjustedAmountChange(row.index, e.target.value, row.amount)
                                        }
                                        onBlur={onAdjustedAmountBlur}
                                        disable={disable}
                                        step={1}
                                    />
                                )}
                            </td>
                            {(disable || isEmployee) ? null : (
                                <td>
                                    {row?.taxHeadCode === "BPA_TOTAL" ? null : (
                                        <UploadFile
                                            key={row.index}
                                            id={`file-${row.id}`}
                                            onUpload={(file) => handleFileUpload(row.index, file || null)}
                                            onDelete={() => handleFileDelete(row.index)}
                                            message={
                                                row.filestoreId
                                                    ? `1 ${t("FILEUPLOADED")}`
                                                    : t("ES_NO_FILE_SELECTED_LABEL")
                                            }
                                            disabled={disable}
                                        />
                                    )}
                                </td>
                            )}
                            <td>
                                {row?.taxHeadCode === "BPA_TOTAL" ? (
                                    row?.grandTotal !== null && row?.grandTotal !== undefined
                                        ? `₹ ${row.grandTotal.toLocaleString()}`
                                        : t("CS_NA")
                                ) : (
                                    <div>
                                        {sanctionFeeData[row.index]?.onDocumentLoading ? (
                                            <Loader />
                                        ) : sanctionFeeData[row.index]?.documentError ? (
                                            <div style={{ fontSize: "12px", color: "red" }}>
                                                {sanctionFeeData[row.index]?.documentError}
                                            </div>
                                        ) : (
                                            <div>
                                                {sanctionFeeData[row.index]?.filestoreId ? (
                                                    <LinkButton
                                                        onClick={() => {
                                                            routeTo(sanctionFeeData[row.index]?.filestoreId, row.index);
                                                        }}
                                                        label={t("BPA_VIEW_DOCUMENT")}
                                                        className="view-link-button"
                                                    />
                                                ) : (
                                                    t("CS_NA")
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
