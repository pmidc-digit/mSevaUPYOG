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

const FeeEstimation = ({
    currentStepData,
    development,
    otherCharges,
    lessAdjusment,
    otherChargesDisc,
    labourCess,
    gaushalaFees,
    malbafees,
    waterCharges,
    setOtherChargesVal,
    setDevelopmentVal,
    setLessAdjusmentVal,
    setOtherChargesDis,
    selectfile,
    uploadedFile,
    setUploadedFile,
    errorFile,
    setError,
    uploadedFileLess,
    disable=false
}) => {
    const [showToast, setShowToast] = useState(null);
    const [isDisabled, setIsDisabled] = useState();
    const { t } = useTranslation();
    const stateCode = Digit.ULBService.getStateId();
    const isMobile = window.Digit.Utils.browser.isMobile();

    const [isLoading, setIsLoading] = useState(false);
    const [BPA, setBPA] = useState({ ...(currentStepData?.createdResponse || {}) })
    const [recalculate, setRecalculate] = useState(false);


    const closeToast = () => {
        setShowToast(null);
    };

    const isCitizen = window.location.href.includes("citizen");
    const isEmployee = window.location.href.includes("employee");
    const isNewConstructionPage = window.location.href.includes("bpa/building_plan_scrutiny/new_construction/");

    const isEditable =
    (isCitizen && isNewConstructionPage) || isEmployee;


    // const { isLoading: bpaCalculatorLoading, error, data, isSuccess } = Digit.Hooks.obps.useBPACalculation({ paayload: {CalulationCriteria:[{
    //     applicationNo: currentStepData?.createdResponse?.applicationNo,
    //     tenantId: currentStepData?.createdResponse?.tenantId,
    //     feeType: "ApplicationFee",
    //     isOnlyEstimates: "true",
    //     BPA: {...currentStepData?.createdResponse}
    // }]} });
    // const { isLoading: bpaCalculatorLoadingSan, errorSan, dataSan, isSuccessSan } = Digit.Hooks.obps.useBPACalculation({ payload: {CalulationCriteria:[{
    //     applicationNo: currentStepData?.createdResponse?.applicationNo,
    //     tenantId: currentStepData?.createdResponse?.tenantId,
    //     feeType: "SanctionFee",
    //     isOnlyEstimates: "true",
    //     BPA: {...currentStepData?.createdResponse}
    // }] }});

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
                BPA: { ...BPA }
            }]
        },
        queryKey: ["BPA_CALCULATION", currentStepData?.createdResponse?.applicationNo, "SanctionFee"]
    });


    // Memoized Application Fee data
    const applicationFeeData = useMemo(() => {
        if (!data || !data?.Calculations?.[0]?.taxHeadEstimates || data?.Calculations?.[0].taxHeadEstimates.length === 0) return [];
        return data?.Calculations?.[0].taxHeadEstimates.map((tax, index) => ({
            id: `app-${index}`,
            title: tax.taxHeadCode || t("CS_NA"),
            amount: tax.estimateAmount !== undefined && tax.estimateAmount !== null ? tax.estimateAmount : t("CS_NA"),
            category: tax.category || t("CS_NA"),
        }));
    }, [data, t]);

    // Memoized Sanction Fee data
    const sanctionFeeData = useMemo(() => {
        if (!dataSan || !dataSan?.Calculations?.[0]?.taxHeadEstimates || dataSan?.Calculations?.[0].taxHeadEstimates.length === 0) return [];
        return dataSan?.Calculations?.[0].taxHeadEstimates.map((tax, index) => ({
            id: `san-${index}`,
            title: tax.taxHeadCode || t("CS_NA"),
            amount: tax.estimateAmount !== undefined && tax.estimateAmount !== null ? tax.estimateAmount : t("CS_NA"),
            category: tax.category || t("CS_NA"),
        }));
    }, [dataSan, t]);

    const applicationFeeDataWithTotal = useMemo(() => {
    if (!applicationFeeData || applicationFeeData.length === 0) return [];
    const totalAmount = applicationFeeData.reduce((acc, item) => acc + (item.amount || 0), 0);
    return [
        ...applicationFeeData,
        { id: "app-total", title: t("BPA_TOTAL"), amount: totalAmount, category: "" }
    ];
}, [applicationFeeData, t]);

// Memoized total for Sanction Fee
const sanctionFeeDataWithTotal = useMemo(() => {
    if (!sanctionFeeData || sanctionFeeData.length === 0) return [];
    const totalAmount = sanctionFeeData.reduce((acc, item) => acc + (item.amount || 0), 0);
    return [
        ...sanctionFeeData,
        { id: "san-total", title: t("BPA_TOTAL"), amount: totalAmount, category: "" }
    ];
}, [sanctionFeeData, t]);

console.log("ApplicationFeesAndSanctionFee", sanctionFeeDataWithTotal)

    useEffect(()=>{
        if(recalculate){
            setBPA({
                ...currentStepData?.createdResponse,
                otherFeesDiscription: otherChargesDisc || "",
                additionalDetails: {
                    ...currentStepData?.createdResponse?.additionalDetails,
                    selfCertificationCharges: {
                        ...currentStepData?.createdResponse?.additionalDetails?.selfCertificationCharges,
                        BPA_LESS_ADJUSMENT_PLOT: lessAdjusment?.length > 0 ? lessAdjusment : "0",
                        BPA_DEVELOPMENT_CHARGES: development?.length > 0 ? development : "0",
                        BPA_OTHER_CHARGES: otherCharges?.length > 0 ? otherCharges : "0"
                    },

                }
            })
            setRecalculate(false);
        }
    },[recalculate])

    useEffect(() => {
    if (BPA) {
        refetchSanctionFee();
    }
    }, [BPA, refetchSanctionFee]);



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
    const sanctionFeeColumns = [
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



    if (isLoading) return (<Loader />);

    return (
        <div>
            {/* Application Fee Table */}
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
            {disable? null: <div>
                {showToast && <Toast error={true} label={t(`${showToast?.message}`)} onClose={closeToast} isDleteBtn={true} />}
                <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                <CardLabel>{t("BPA_COMMON_DEVELOPMENT_AMT")}</CardLabel>
                <TextInput
                    t={t}
                    type={"text"}
                    isMandatory={false}
                    optionKey="i18nKey"
                    name="development"
                    defaultValue={currentStepData?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES}
                    value={development}
                    onChange={(e) => {
                        setDevelopmentVal(e.target.value);
                    }}
                    {...{ required: true, pattern: "^[0-9]*$" }}
                    disable={!isEditable}
                />
                <CardLabel>{t("BPA_COMMON_OTHER_AMT")}</CardLabel>
                <TextInput
                    t={t}
                    type={"text"}
                    isMandatory={false}
                    optionKey="i18nKey"
                    name="otherCharges"
                    defaultValue={currentStepData?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES}
                    value={otherCharges}
                    onChange={(e) => {
                        setOtherChargesVal(e.target.value);
                    }}
                    {...{ required: true, pattern: /^[0-9]*$/ }}
                    disable={!isEditable}
                />
                {parseInt(otherCharges) > 0 ? (
                    <div>
                        <CardLabel>{t("BPA_COMMON_OTHER_AMT_DISCRIPTION")}</CardLabel>
                        <TextArea
                            t={t}
                            type={"text"}
                            name="otherChargesDiscription"
                            defaultValue={currentStepData?.additionalDetails?.otherFeesDiscription}
                            value={otherChargesDisc}
                            onChange={(e) => {
                                setOtherChargesDis(e.target.value);
                            }}
                            {...{ required: true }}
                            disable={!isEditable}
                        />
                    </div>
                ) : null}
                <CardLabel>{t("BPA_COMMON_LESS_AMT")}</CardLabel>
                <TextInput
                    t={t}
                    type={"text"}
                    isMandatory={false}
                    optionKey="i18nKey"
                    name="lessAdjusment"
                    defaultValue={currentStepData?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT}
                    value={lessAdjusment}
                    onChange={(e) => {
                        setLessAdjusmentVal(e.target.value);
                    }}
                    {...{ required: true, pattern: "^[0-9]*$" }}
                    disable={!isEditable}
                />
                {(parseInt(lessAdjusment) > 0 && window.location.href.includes("citizen")) ? (
                    <div>
                        <CardLabel>{t("BPA_COMMON_LESS_AMT_FILE")}</CardLabel>
                        <UploadFile
                            id={"noc-doc"}
                            style={{ marginBottom: "200px" }}
                            onUpload={selectfile}
                            onDelete={() => {
                                setUploadedFile(null);
                                setFile("");
                            }}
                            message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
                            error={errorFile}
                        // uploadMessage={uploadMessage}
                        />
                    </div>
                ) : null}
                <SubmitBar onSubmit={() => {setRecalculate(true)}} label={t("Recalculate")} disabled={!isEditable}/>
            </div>}

            {/* Sanction Fee Table */}
            {bpaCalculatorLoadingSan ? <Loader /> : <div><CardSubHeader style={{ fontSize: "20px", color: "#3f4351", marginTop: "24px" }}>
                {t("BPA_SANCTION_FEE")}
            </CardSubHeader>
                <Table
                    className="customTable table-border-style"
                    t={t}
                    data={sanctionFeeDataWithTotal}
                    columns={sanctionFeeColumns}
                    getCellProps={() => ({ style: {} })}
                    disableSort={true}
                    // autoSort={true}
                    manualPagination={false}
                    isPaginationRequired={false}
                    pageSizeLimit={25}
                />
            </div>}

        </div>
    );
};

export default FeeEstimation;
