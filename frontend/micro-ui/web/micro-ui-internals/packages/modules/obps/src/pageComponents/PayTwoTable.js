import React, { useEffect, useState, useMemo } from "react";
import { fromUnixTime, format } from "date-fns";
import {
    TextInput,
    Header,
    Toast,
    Card,
    StatusTable,
    Row,
    Loader,
    Menu,
    PDFSvg,
    SubmitBar,
    LinkButton,
    ActionBar,
    CheckBox,
    MultiLink,
    CardText,
    CardSubHeader,
    CardLabel,
    OTPInput,
    TextArea,
    UploadFile,
    CardHeader,
    Table
} from "@mseva/digit-ui-react-components";
import Timeline from "../components/Timeline";
import { useTranslation } from "react-i18next";
import { scrutinyDetailsData } from "../utils";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useHistory } from "react-router-dom";

const thStyle = {
    border: "1px solid #ddd",
    padding: "12px 16px",
    background: "#f4f4f4",
    textAlign: "left",
    verticalAlign: "top",
    fontWeight: "600",
};

const tdStyle = {
    borderTop: "1px solid #ddd",
    padding: "12px 16px",
    textAlign: "left",
    verticalAlign: "middle",
};

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
    t
}) => {
    return (<div style={{ overflowX: "auto" }}>
                    <CardSubHeader style={{ fontSize: "20px", color: "#3f4351", marginTop: "24px" }}>
                        {t("BPA_SANCTION_FEE")}
                    </CardSubHeader>
    
    
                    <table
                        className="sanction-fee-table"
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            fontSize: "16px",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={thStyle}>{t("BPA_TAXHEAD_CODE")}</th>
                                <th style={thStyle}>{t("BPA_AMOUNT")}</th>
                                <th style={thStyle}>{t("BPA_ADJUSTED_AMOUNT")}</th>
                                {(disable || isEmployee) ? null : <th style={thStyle}>{t("BPA_FILE_UPLOAD")}</th>}
                                <th style={thStyle}>{t("BPA_VIEW_DOCUMENT")}</th> {/* New Column */}
                            </tr>
                        </thead>
                        <tbody>
                            {sanctionFeeDataWithTotal.map((row, i) => (
                                <tr key={row.index}>
                                    <td style={tdStyle}>{row.title || t("CS_NA")}</td>
                                    <td style={tdStyle}>
                                        {row.amount !== null && row.amount !== undefined
                                            ? `₹ ${row.amount.toLocaleString()}`
                                            : t("CS_NA")}
                                    </td>
    
                                    <td style={tdStyle}>
                                        {row?.taxHeadCode === "BPA_TOTAL" ?
                                            (row.adjustedAmount !== null && row.adjustedAmount !== undefined
                                                ? `₹ ${row.adjustedAmount.toLocaleString()}`
                                                : t("CS_NA"))
                                            : <TextInput
                                                t={t}
                                                type="number"
                                                isMandatory={false}
                                                // className="hide-number-spinner"
                                                value={sanctionFeeData[row.index]?.adjustedAmount || ""}
                                                onChange={(e) =>
                                                    handleAdjustedAmountChange(row.index, e.target.value, row.amount)
                                                }
                                                onBlur={onAdjustedAmountBlur}
                                                disable={disable}
                                                step={1}                                                
                                                style={{
                                                    width: "100%",
                                                    padding: "4px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "4px",
                                                }}
                                            />}
                                    </td>
                                    {(disable || isEmployee) ? null : <td style={tdStyle}>
                                        {(row?.taxHeadCode === "BPA_TOTAL") ? null : <UploadFile
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
                                        />}
                                    </td>}
                                    <td style={tdStyle}>
                                        {row?.taxHeadCode === "BPA_TOTAL" ?
                                            (row?.grandTotal !== null && row?.grandTotal !== undefined
                                                ? `₹ ${row.grandTotal.toLocaleString()}`
                                                : t("CS_NA"))
                                            : <div>{sanctionFeeData[row.index]?.onDocumentLoading ?
                                                <Loader /> : sanctionFeeData[row.index]?.documentError ? <div style={{ fontSize: "12px", color: "red" }} >{sanctionFeeData[row.index]?.documentError}</div> : <div>{sanctionFeeData[row.index]?.filestoreId ? (
                                                    <LinkButton onClick={() => {
                                                        routeTo(sanctionFeeData[row.index]?.filestoreId, row.index)
                                                    }} style={{ textDecoration: "underline", padding: 0 }
                                                    }
                                                        label={t("BPA_VIEW_DOCUMENT")}
                                                    />
                                                ) : (
                                                    t("CS_NA")
                                                )}</div>}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
    
                </div>)
}