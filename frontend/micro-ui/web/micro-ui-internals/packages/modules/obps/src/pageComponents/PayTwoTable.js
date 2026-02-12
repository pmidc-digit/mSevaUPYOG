import React from "react";
import {
    TextInput,
    Loader,
    LinkButton,
    CardSubHeader,
    UploadFile,
} from "@mseva/digit-ui-react-components";
import CustomUploadFile from "../components/CustomUploadFile";
import CustomFeeTable from "../../../templates/ApplicationDetails/components/CustomFeeTable";

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
    const columns = [
        /* ---------------- Tax Head ---------------- */
        {
            key: "title",
            label: "BPA_TAXHEAD_CODE",
            headerLabel: "BPA_TAXHEAD_CODE",
            type: "text",
        },

        /* ---------------- Amount ---------------- */
        {
            key: "amount",
            label: "BPA_AMOUNT",
            headerLabel: "BPA_AMOUNT",
            type: "custom",
            render: (row, rowIndex, t) => {
                if (row.amount === null || row.amount === undefined) {
                    return t("CS_NA");
                }
                return `₹ ${row.amount.toLocaleString("en-IN")}`;
            },
        },

        /* ---------------- Adjusted Amount ---------------- */
        {
            key: "adjustedAmount",
            label: "BPA_ADJUSTED_AMOUNT",
            headerLabel: "BPA_ADJUSTED_AMOUNT",
            type: "number",
            step: 1,
            isMandatory: false,

            getValue: (row) => {
                if (row.taxHeadCode === "BPA_TOTAL") {
                    return row.adjustedAmount ?? "";
                }
                return sanctionFeeData[row.index]?.adjustedAmount ?? "";
            },

            onChange: (index, value, row) => {
                handleAdjustedAmountChange(index, value, row.amount);
            },

            onBlur: (e, index, row) => {
                onAdjustedAmountBlur(e, index, row);
            },

            disable: (row) => row.taxHeadCode === "BPA_TOTAL" || disable,
        },

        /* ---------------- File Upload ---------------- */
        {
            key: "fileUpload",
            label: "BPA_FILE_UPLOAD",
            headerLabel: "BPA_FILE_UPLOAD",
            type: "custom",
            render: (row, rowIndex, t) => {
                if (row.taxHeadCode === "BPA_TOTAL") return null;

                return (
                    <CustomUploadFile
                        key={row.index}
                        id={`file-${row.id}`}
                        onUpload={(file) =>
                            handleFileUpload(row.index, file || null)
                        }
                        onDelete={() => handleFileDelete(row.index)}
                        message={
                            row.filestoreId
                                ? `1 ${t("FILEUPLOADED")}`
                                : t("ES_NO_FILE_SELECTED_LABEL")
                        }
                        uploadedFile={row.filestoreId}
                        disabled={disable}
                    />
                );
            },
        },

        /* ---------------- Remarks / Total ---------------- */
        {
            key: "remark",
            label: "BPA_REMARKS",
            headerLabel: "BPA_REMARKS",
            type: "custom",
            render: (row, rowIndex, t) => {
                if (row.taxHeadCode === "BPA_TOTAL") {
                    return row.grandTotal !== null && row.grandTotal !== undefined
                        ? `₹ ${row.grandTotal.toLocaleString("en-IN")}`
                        : t("CS_NA");
                }

                return (
                    <TextInput
                        t={t}
                        type="text"
                        isMandatory={false}
                        value={sanctionFeeData[row.index]?.remark || ""}
                        onChange={(e) =>
                            handleRemarkChange(row.index, e.target.value, row.amount)
                        }
                        disable={disable}
                        style={{
                            width: "100%",
                            padding: "4px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                );
            },
        },
    ];

    return (
        <div className="bpa-table-container">
            <CardSubHeader className="bpa-block-header" style={{ marginTop: "24px" }}>
                {t("BPA_SANCTION_FEE")}
            </CardSubHeader>

            {/* <table className="customTable table-border-style">
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
                            { (
                                <td>
                                    {row?.taxHeadCode === "BPA_TOTAL" ? null : (
                                        <CustomUploadFile
                                            key={row.index}
                                            id={`file-${row.id}`}
                                            onUpload={(file) => handleFileUpload(row.index, file || null)}
                                            onDelete={() => handleFileDelete(row.index)}
                                            message={
                                                row.filestoreId
                                                    ? `1 ${t("FILEUPLOADED")}`
                                                    : t("ES_NO_FILE_SELECTED_LABEL")
                                            }
                                            uploadedFile={row.filestoreId}
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
                                ) : <TextInput
                                    t={t}
                                    type="text"
                                    isMandatory={false}
                                    // className="hide-number-spinner"
                                    value={sanctionFeeData[row.index]?.remark || ""}
                                    onChange={(e) =>
                                        handleRemarkChange(row.index, e.target.value, row.amount)
                                    }
                                    // onBlur={onAdjustedAmountBlur}
                                    disable={disable}
                                    // step={1}                                                
                                    style={{
                                        width: "100%",
                                        padding: "4px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                    }}
                                />}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table> */}

            <CustomFeeTable
                data={sanctionFeeDataWithTotal}
                columns={columns}
                // extraStyleName="Layout"
                t={t}
                readOnly={false}
            />            
        </div>
    );
};
