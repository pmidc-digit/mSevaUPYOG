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
import { PayTwoTable } from "./PayTwoTable";

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

const FeeEstimation = ({
    currentStepData,
    development = "0",
    otherCharges = "0",
    lessAdjusment = "0",
    labourCess,
    gaushalaFees,
    malbafees,
    waterCharges,
    adjustedAmounts,
    setAdjustedAmounts,
    disable = false
}) => {
    const [showToast, setShowToast] = useState(null);
    const [isDisabled, setIsDisabled] = useState();
    const { t } = useTranslation();
    const stateCode = Digit.ULBService.getStateId();
    const isMobile = window.Digit.Utils.browser.isMobile();

    const [isLoading, setIsLoading] = useState(false);
    const [BPA, setBPA] = useState({ ...(currentStepData?.createdResponse || {}) })
    // const [recalculate, setRecalculate] = useState(false);
    const [sanctionFeeData, setSanctionFeeData] = useState(adjustedAmounts || []);


    const closeToast = () => {
        setShowToast(null);
    };

    const isCitizen = window.location.href.includes("citizen");
    const isEmployee = window.location.href.includes("employee");
    const isNewConstructionPage = window.location.href.includes("bpa/building_plan_scrutiny/new_construction/");

    const isEditable =
        (isCitizen && isNewConstructionPage) || isEmployee;



    const {
        isLoading: bpaCalculatorLoading,
        error,
        data,
        isSuccess
    } = Digit.Hooks.obps.useBPACalculation({
        payload: {
            CalulationCriteria: [{
                applicationNo: currentStepData?.createdResponse?.applicationNo,
                tenantId: currentStepData?.createdResponse?.tenantId,
                feeType: "ApplicationFee",
                isOnlyEstimates: "true",
                BPA: {
                    ...currentStepData?.createdResponse,
                    applicationType: currentStepData?.createdResponse?.additionalDetails?.applicationType || null
                }
            }]
        },
        queryKey: ["BPA_CALCULATION", currentStepData?.createdResponse?.applicationNo, "ApplicationFee"]
    });
    console.log("data from bpa calculator", adjustedAmounts);

    const {
        isLoading: bpaCalculatorLoadingSan,
        error: errorSan,
        data: dataSan,
        isSuccess: isSuccessSan,
        refetch: refetchSanctionFee
    } = Digit.Hooks.obps.useBPACalculation({
        payload: {
            CalulationCriteria: [{
                applicationNo: currentStepData?.createdResponse?.applicationNo,
                tenantId: currentStepData?.createdResponse?.tenantId,
                feeType: "SanctionFee",
                isOnlyEstimates: "true",
                BPA: {
                    ...BPA,
                    additionalDetails: {
                        ...currentStepData?.createdResponse?.additionalDetails,
                        adjustedAmounts: [
                            ...(Array.isArray(sanctionFeeData) && sanctionFeeData.length > 0
                                ? sanctionFeeData
                                : Array.isArray(currentStepData?.createdResponse?.additionalDetails?.adjustedAmounts)
                                    ? currentStepData.createdResponse.additionalDetails.adjustedAmounts
                                    : [])
                        ],
                        selfCertificationCharges: {
                            BPA_MALBA_CHARGES: malbafees?.length > 0 ? malbafees : "0",
                            BPA_LABOUR_CESS: labourCess?.length > 0 ? labourCess : "0",
                            BPA_WATER_CHARGES: waterCharges?.length > 0 ? waterCharges : "0",
                            BPA_GAUSHALA_CHARGES_CESS: gaushalaFees?.length > 0 ? gaushalaFees : "0",
                            BPA_LESS_ADJUSMENT_PLOT: lessAdjusment?.length > 0 ? lessAdjusment : "0",
                            BPA_DEVELOPMENT_CHARGES: development?.length > 0 ? development : "0",
                            BPA_OTHER_CHARGES: otherCharges?.length > 0 ? otherCharges : "0"
                        }
                    }
                }
            }]
        },
        queryKey: ["BPA_CALCULATION", currentStepData?.createdResponse?.applicationNo, "SanctionFee"]
    });


    // Memoized Application Fee data
    const applicationFeeData = useMemo(() => {
        if (!data || !data?.Calculations?.[0]?.taxHeadEstimates || data?.Calculations?.[0].taxHeadEstimates.length === 0) return [];
        return data?.Calculations?.[0].taxHeadEstimates.map((tax, index) => ({
            id: t(`app-${index}`),
            title: t(tax.taxHeadCode) || t("CS_NA"),
            taxHeadCode: tax.taxHeadCode,
            amount: tax.estimateAmount !== undefined && tax.estimateAmount !== null ? tax.estimateAmount : t("CS_NA"),
            category: tax.category || t("CS_NA"),
            adjustedAmount: "",
            filestoreId: null,
        }));
    }, [data, t]);

    const applicationFeeDataWithTotal = useMemo(() => {
        if (!applicationFeeData || applicationFeeData.length === 0) return [];
        const totalAmount = applicationFeeData.reduce((acc, item) => acc + (item.amount || 0), 0);
        return [
            ...applicationFeeData,
            { id: "app-total", title: t("BPA_TOTAL"), amount: totalAmount, category: "" }
        ];
    }, [applicationFeeData, t]);

    // Memoized total for Sanction Fee
    // const sanctionFeeDataWithTotal = useMemo(() => {
    //     if (!sanctionFeeData || sanctionFeeData.length === 0) return [];
    //     const totalAmount = sanctionFeeData.reduce((acc, item) => acc + (item.amount || 0), 0);
    //     const totalDeduction = sanctionFeeData.reduce((acc, item) => acc + (item.adjustedAmount || 0), 0);
    //     const grandTotal = totalAmount - totalDeduction;
    //     return [
    //         ...sanctionFeeData,
    //         { id: "san-total", taxHeadCode:"BPA_TOTAL" ,title: t("BPA_TOTAL"), amount: totalAmount, category: "", adjustedAmount: totalDeduction , grandTotal: grandTotal },
    //     ];
    // }, [sanctionFeeData, t]);

    const sanctionFeeDataWithTotal = useMemo(() => {
        if (!adjustedAmounts || adjustedAmounts.length === 0) return [];
        const totalAmount = adjustedAmounts.reduce((acc, item) => acc + (item.amount || 0), 0);
        const totalDeduction = adjustedAmounts.reduce((acc, item) => acc + (item.adjustedAmount || 0), 0);
        const grandTotal = totalAmount - totalDeduction;
        return [
            ...adjustedAmounts,
            { id: "san-total", taxHeadCode: "BPA_TOTAL", title: t("BPA_TOTAL"), amount: totalAmount, category: "", adjustedAmount: totalDeduction, grandTotal: grandTotal },
        ];
    }, [adjustedAmounts, t]);

    useEffect(() => {
        if (!adjustedAmounts || adjustedAmounts.length === 0) return;

        setSanctionFeeData(adjustedAmounts);

    }, [adjustedAmounts])


    useEffect(() => {
        if (!dataSan || !dataSan?.Calculations?.[0]?.taxHeadEstimates || dataSan?.Calculations?.[0].taxHeadEstimates.length === 0) {
            setAdjustedAmounts([]);
            return;
        }

        const mappedData = dataSan.Calculations[0].taxHeadEstimates.map((tax, index) => ({
            index,
            id: t(`app-${index}`),
            title: t(tax.taxHeadCode) || t("CS_NA"),
            taxHeadCode: tax.taxHeadCode,
            amount: tax.estimateAmount !== undefined && tax.estimateAmount !== null ? tax.estimateAmount : t("CS_NA"),
            category: tax.category || t("CS_NA"),
            adjustedAmount: tax?.adjustedAmount || 0,
            filestoreId: tax?.filestoreId || null,
            onDocumentLoading: false,
            documentError: null,
        }));

        setAdjustedAmounts(mappedData);
    }, [dataSan, t]);


    // useEffect(() => {
    //     if (recalculate) {
    //         setBPA({
    //             ...currentStepData?.createdResponse,
    //             additionalDetails: {
    //                 ...currentStepData?.createdResponse?.additionalDetails,
    //                 selfCertificationCharges: {
    //                     ...currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges,
    //                     BPA_LESS_ADJUSMENT_PLOT: lessAdjusment?.length > 0 ? lessAdjusment : "0",
    //                     BPA_DEVELOPMENT_CHARGES: development?.length > 0 ? development : "0",
    //                     BPA_OTHER_CHARGES: otherCharges?.length > 0 ? otherCharges : "0"
    //                 },

    //             }
    //         })
    //         setRecalculate(false);
    //     }
    // }, [recalculate])

    // useEffect(() => {
    //     if (recalculate) {
    //         refetchSanctionFee();
    //         setRecalculate(false);
    //     }
    // }, [recalculate, refetchSanctionFee]);

    const handleAdjustedAmountChange = (index, value, ammount) => {
        if(Number(value)>ammount){
            setShowToast({ key: "error", message: "Adjusted_Amount_More_Than_Ammount" });
            return;
        }
        setSanctionFeeData((prev) =>
            prev.map((item) =>
                item.index === index
                    ? { ...item, adjustedAmount: Number(value) ? Number(value) : 0 } // update the adjustedAmount for the correct row
                    : item
            )
        );
    };


    const handleFileUpload = async (index, e) => {
        const file = e.target.files[0];
        try {
            setAdjustedAmounts((prev) => // For direct Upload of File use setAdjustedAmounts
                prev.map((item, i) =>
                    i === index ? { ...item, onDocumentLoading: true } : item
                ));
            const response = await Digit.UploadServices.Filestorage(
                "property-upload",
                file,
                stateCode,
            )
            if (response?.data?.files?.length > 0) {
                setAdjustedAmounts((prev) => // For direct Upload of File use setAdjustedAmounts
                    prev.map((item, i) =>
                        i === index ? { ...item, filestoreId: response?.data?.files[0]?.fileStoreId, onDocumentLoading: false, documentError: null } : item
                    ));
            } else {
                //   setErrors((prev) => ({ ...prev, ecbcElectricalLoadFile: t("PT_FILE_UPLOAD_ERROR") }))
                setAdjustedAmounts((prev) => // For direct Upload of File use setAdjustedAmounts
                    prev.map((item, i) =>
                        i === index ? { ...item, filestoreId: null, documentError: t("PT_FILE_UPLOAD_ERROR"), onDocumentLoading: false } : item
                    ));
                setShowToast({ key: "error", message: "PT_FILE_UPLOAD_ERROR" });
            }
        } catch (err) {
            setAdjustedAmounts((prev) => // For direct Upload of File use setAdjustedAmounts
                prev.map((item, i) =>
                    i === index ? { ...item, filestoreId: null, documentError: t("PT_FILE_UPLOAD_ERROR"), onDocumentLoading: false } : item
                ));
            setShowToast({ key: "error", message: "PT_FILE_UPLOAD_ERROR" });
        }
    };

    const handleFileDelete = (index) => {
        setAdjustedAmounts((prev) => // For direct Upload of File use setAdjustedAmounts
            prev.map((item, i) =>
                i === index ? { ...item, filestoreId: null } : item
            )
        );
    };


    // Table columns for Application Fee
    const applicationFeeColumns = [
        {
            Header: t("BPA_TAXHEAD_CODE"),
            accessor: "title",
            Cell: ({ value }) => value || t("CS_NA"),
        },
        {
            Header: t("BPA_AMOUNT"),
            accessor: "amount",
            Cell: ({ value }) => (value !== null && value !== undefined ? `₹ ${value.toLocaleString()}` : t("CS_NA")),
        },
    ];


    const getUrlForDocumentView = async (filestoreId, index) => {
        if (filestoreId?.length === 0) return;

        try {
            setSanctionFeeData((prev) =>
                prev.map((item, i) =>
                    i === index ? { ...item, onDocumentLoading: true } : item
                ));

            // Call Digit service
            const result = await Digit.UploadServices.Filefetch([filestoreId], stateCode);
            if (result?.data) {
                const fileUrl = result.data[filestoreId];
                if (fileUrl) {
                    setSanctionFeeData((prev) =>
                        prev.map((item, i) =>
                            i === index ? { ...item, onDocumentLoading: false, documentError: null } : item
                        ));
                    return fileUrl;
                } else {
                    setSanctionFeeData((prev) =>
                        prev.map((item, i) =>
                            i === index ? { ...item, filestoreId: null, documentError: t("PT_FILE_LOAD_ERROR") } : item
                        ));
                    return null;
                }
            }
        } catch (error) {
            setSanctionFeeData((prev) =>
                prev.map((item, i) =>
                    i === index ? { ...item, filestoreId: null, documentError: t("PT_FILE_LOAD_ERROR") } : item
                ));
            return null;
        }
    }

    async function routeTo(filestoreId, index) {
        const jumpTo = await getUrlForDocumentView(filestoreId, index)
        if (jumpTo) window.open(jumpTo);
    }

    const onAdjustedAmountBlur = () => {
        if(JSON.stringify(sanctionFeeData) === JSON.stringify(adjustedAmounts)){
            return ;
        }
        refetchSanctionFee();
    }



    if (isLoading) return (<Loader />);

    return (
        <div>
            {/* Application Fee Table */}
            <CardSubHeader style={{ fontSize: "20px", marginTop: "20px" }}>{t("BPA_FEE_DETAILS")}</CardSubHeader>
            {bpaCalculatorLoading ? <Loader /> : <div><CardSubHeader style={{ fontSize: "20px", color: "#3f4351" }}>
                {t("BPA_APPLICATION_FEE")}
            </CardSubHeader>
                <Table
                    className="customTable table-border-style"
                    t={t}
                    data={applicationFeeDataWithTotal}
                    columns={applicationFeeColumns}
                    getCellProps={() => ({ style: {} })}
                    disableSort={true}
                    // autoSort={true}
                    manualPagination={false}
                    isPaginationRequired={false}
                />
            </div>}

            {bpaCalculatorLoadingSan ? <Loader /> :<PayTwoTable {...{sanctionFeeDataWithTotal,disable,isEmployee,sanctionFeeData,handleAdjustedAmountChange,onAdjustedAmountBlur,handleFileUpload,handleFileDelete,routeTo, t}}/>}

            {/* <div style={{ overflowX: "auto" }}>
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
                            <th style={thStyle}>{t("BPA_VIEW_DOCUMENT")}</th>
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
                                            value={sanctionFeeData[row.index]?.adjustedAmount || ""}
                                            onChange={(e) =>
                                                handleAdjustedAmountChange(row.index, e.target.value, row.amount)
                                            }
                                            onBlur={onAdjustedAmountBlur}
                                            disable={disable}
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

            </div> */}
            {/* {disable ? null : <div style={{ paddingTop: "16px", textAlign: isMobile ? "center" : "right" }}>
                <SubmitBar onSubmit={() => { setRecalculate(true) }} label={t("Recalculate")} disabled={!isEditable} />
            </div>} */}

            {showToast && <Toast error={true} label={t(`${showToast?.message}`)} onClose={closeToast} isDleteBtn={true} />}
        </div>
    );
};

export default FeeEstimation;
