import React, { useState, useEffect, useMemo } from "react";
import { CardLabel, LabelFieldPair, Dropdown, TextInput, LinkButton, DatePicker, CardSectionHeader, DeleteIcon, Table, Loader } from "@mseva/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useLocation } from "react-router-dom";


const createUnitDetails = () => ({
    InspectionDate: "",
    InspectionTime: "",
    Checklist: [],
    Documents: [],
    key: Date.now(),
});

const InspectionReport = ({ config, onSelect, userType, formData, setError, formState, clearErrors, props, fiReport, applicationStatus }) => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const fieldInspectionFieldReports = fiReport ? fiReport : JSON.parse(sessionStorage.getItem("Field_Inspection_FieldReports"));
    const [FieldReports, setFieldReports] = useState(fieldInspectionFieldReports?.length > 0 ? fieldInspectionFieldReports : [createUnitDetails()]);
    const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const stateId = Digit.ULBService.getStateId();
    const [tradeTypeMdmsData, setTradeTypeMdmsData] = useState([]);
    const [tradeCategoryValues, setTradeCategoryValues] = useState([]);
    const [tradeTypeOptionsList, setTradeTypeOptionsList] = useState([]);
    const [questionList, setquestionList] = useState([]);
    const [documentList, setdocumentList] = useState([]);
    const [tradeSubTypeOptionsList, setTradeSubTypeOptionsList] = useState([]);
    const [isErrors, setIsErrors] = useState(false);
    const [previousLicenseDetails, setPreviousLicenseDetails] = useState(formData?.tradedetils1 || []);
    // let isRenewal = window.location.href.includes("tl/renew-application-details");
    // if (window.location.href.includes("tl/renew-application-details")) isRenewal = true;
    const { data: tradeMdmsData, isLoading } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "TradeLicense", "TradeUnits", "[?(@.type=='TL')]");
    const { isLoading: bpaDocsLoading, data: bpaDocs } = Digit.Hooks.obps.useMDMS(stateId, "BPA", ["CheckList"]);
    let type = "LOW"    

    const addNewFieldReport = () => {
        const newUnit = createUnitDetails();
        setFieldReports((prev) => [...prev, newUnit]);
    };


    const removeUnit = (unit) => {
        setFieldReports((prev) => prev.filter((o) => o.key != unit.key));
    };

    useEffect(() => {
        const data = FieldReports.map((e) => {
            return e;
        });
        onSelect("FieldReports", data);
        sessionStorage.setItem("INSPECTION_DATA", JSON.stringify(data));
    }, [FieldReports]);

    useEffect(() => {
        onSelect("tradedetils1", previousLicenseDetails);
    }, [previousLicenseDetails]);

    useEffect(() => {
        let ques = [];
        let documentlist = [];
        bpaDocs && bpaDocs.BPA.CheckList.map((ob) => {
            if (ob?.RiskType === type && ob?.WFState === "FIELDINSPECTION_PENDING") {
                ques = [...ob.questions];
                documentlist = [...ob.docTypes]
            }
        })
        setdocumentList(documentlist);
        setquestionList(ques);
    }, [bpaDocs]);

    const commonProps = {
        focusIndex,
        allFieldReport: FieldReports,
        setFocusIndex,
        removeUnit,
        formData,
        formState,
        setFieldReports,
        t,
        setError,
        clearErrors,
        config,
        onSelect,
        userType,
        tradeCategoryValues,
        tradeTypeOptionsList,
        setTradeTypeOptionsList,
        tradeTypeMdmsData,
        tradeSubTypeOptionsList,
        setTradeSubTypeOptionsList,
        setTradeTypeMdmsData,
        setTradeCategoryValues,
        tradeMdmsData,
        isErrors,
        setIsErrors,
        previousLicenseDetails,
        setPreviousLicenseDetails,
        isLoading,
        bpaDocs,
        type,
        questionList,
        setquestionList,
        documentList,
        props,
        stateId,
        fiReport,
        applicationStatus
    };

    console.log("FieldReports", FieldReports)

    if(bpaDocsLoading){
        return <Loader />
    }

    return (
        <InspectionReportForm  index={0} unit={FieldReports[0]} {...commonProps} />
        // <div>
        //     <React.Fragment>
                //  {FieldReports && FieldReports.map((unit, index) => ( 
                    
                // ))}
            // </React.Fragment>
            // <LinkButton label={t("BPA_ADD_FIELD_INSPECTION")} onClick={addNewFieldReport} style={{ color: "#a82227", width: "fit-content" }} />
        // </div>
    );
};

const InspectionReportForm = (_props) => {
    const {
        unit,
        index,
        focusIndex,
        allFieldReport,
        setFocusIndex,
        removeUnit,
        setFieldReports,
        t,
        formData,
        config,
        onSelect,
        userType,
        setError,
        clearErrors,
        formState,
        tradeCategoryValues,
        tradeTypeOptionsList,
        setTradeTypeOptionsList,
        tradeTypeMdmsData,
        tradeSubTypeOptionsList,
        setTradeSubTypeOptionsList,
        setTradeTypeMdmsData,
        setTradeCategoryValues,
        tradeMdmsData,
        isErrors,
        setIsErrors,
        previousLicenseDetails,
        setPreviousLicenseDetails,
        isLoading,
        bpaDocs,
        type,
        questionList,
        setquestionList,
        documentList,
        props,
        stateId,
        fiReport,
        applicationStatus
    } = _props;

    const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, trigger, getValues } = useForm();
    const formValue = watch();
    const { errors } = localFormState;

    const isIndividualTypeOwner = useMemo(() => formData?.ownershipCategory?.code.includes("INDIVIDUAL"), [formData?.ownershipCategory?.code]);
    const siteImages = JSON.parse(sessionStorage.getItem("Field_Inspection_siteImages"))
    // const geoLocations = JSON.parse(sessionStorage.getItem("Field_Inspection_geoLocations"))
    const documentData = siteImages?.map((value, index) => ({
        title: `SITE_IMAGE_${index+1}`,
        imageFileStoreId: value,
        // geoLocation: geoLocations[index] 
    }))
    const today = new Date().toISOString().split("T")[0];

    console.log("formDataprops", siteImages,  documentData, questionList)

    function routeTo(filestoreId) {
        getUrlForDocumentView(filestoreId)
    }

    const getUrlForDocumentView = async (filestoreId) => {
        if (filestoreId?.length === 0) return;
        try {
            const result = await Digit.UploadServices.Filefetch([filestoreId], stateId);
            if (result?.data) {
                const fileUrl = result.data[filestoreId];
                if (fileUrl) {
                    window.open(fileUrl, "_blank");
                } else {
                    if(props?.setError){
                        props?.setError(t("CS_FILE_FETCH_ERROR"));
                    }else{
                        console.error(t("CS_FILE_FETCH_ERROR"))
                    }
                }
            } else {
                if (props?.setError) {
                    props?.setError(t("CS_FILE_FETCH_ERROR"));
                } else {
                    console.error(t("CS_FILE_FETCH_ERROR"))
                }
            }
        } catch (e) {
            if (props?.setError) {
                props?.setError(t("CS_FILE_FETCH_ERROR"));
            } else {
                console.error(t("CS_FILE_FETCH_ERROR"))
            }
        }
    }

    const routeToGeo = (geoLocation) => {
           window.open(`https://bharatmaps.gov.in/BharatMaps/Home/Map?lat=${Number(geoLocation.latitude).toFixed(6)}&long=${Number(geoLocation.longitude).toFixed(6)}`, "_blank")
    }

    const documentsColumns = [
        {
          Header: t("BPA_DOCUMENT_DETAILS_LABEL"),
          accessor: "title",
          Cell: ({ value }) => t(value) || t("CS_NA"),
        },
        {
          Header: t(" "),
          accessor: "imageFileStoreId",
          Cell: ({ value }) =>
            {          
              return value ? (
              <LinkButton style={{ float: "right", display: "inline" }}
                label={t("View Image")}
                onClick={() => routeTo(value)}
              />
            ) : (
              t("CS_NA")
            )},
        },
        // {
        //   Header: t(" "),
        //   accessor: "geoLocation",
        //   Cell: ({ value }) =>
        //     {          
        //       return value ? (
        //       <LinkButton style={{ float: "right", display: "inline" }}
        //         label={t("View Location")}
        //         onClick={() => routeToGeo(value)}
        //       />
        //     ) : (
        //       t("CS_NA")
        //     )},
        // },
      ];

    useEffect(() => {
        trigger();
    }, []);

    useEffect(() => {
        const keys = Object.keys(formValue);
        const part = {};
        keys.forEach((key) => (part[key] = unit[key]));

        let _ownerType = isIndividualTypeOwner ? {} : { ownerType: { code: "NONE" } };
        let questionLength = questionList ? { questionLength: questionList.length } : { questionLength: 0 };
        let Ques = questionList ? { questionList: questionList } : { questionList: [] };

        if (!_.isEqual(formValue, part)) {
            Object.keys(formValue).map(data => {
                if (data != "key" && formValue[data] != undefined && formValue[data] != "" && formValue[data] != null && !isErrors) {
                    setIsErrors(true);
                }
            });
            setFieldReports((prev) => prev.map((o) => (o.key && o.key === unit.key ? { ...o, ...formValue, ..._ownerType, ...questionLength, ...Ques } : { ...o })));
            trigger();
        }
    }, [formValue]);

    useEffect(() => {
        // if (Object.keys(errors)?.length && !_.isEqual(formState?.errors?.[config?.key]?.type || {}, errors)) {
        //     setError(config?.key, { type: errors });
        // }
        // else if (!Object.keys(errors)?.length && formState?.errors?.[config?.key] && isErrors) {
        //     clearErrors(config?.key);
        // }
        console.error("errors in inspection report" ,{errors})
    }, [errors]);

    let ckeckingLocation = window.location.href.includes("renew-application-details");
    if (window.location.href.includes("edit-application-details")) ckeckingLocation = true;

    const getOptions = (option) => {
        let fieldoptions = []
        option.split("/").map((op) => {
            fieldoptions.push({ i18nKey: `SCORE_${op}`, code: op });
        })
        return fieldoptions;
    }

    const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
    return (
        <React.Fragment>
            {/* <div>          */}
                    {allFieldReport?.length > 1 ? (
                        <LinkButton
                            label={<DeleteIcon style={{ float: "right", position: "relative", bottom: "-6px" }} fill={!(allFieldReport.length == 1) ? "#494848" : "#FAFAFA"} />}
                            style={{ width: "100px", display: "inline", background: "black" }}
                            onClick={(e) => removeUnit(unit)}
                        />
                    ) : null}
                    <CardSectionHeader>{allFieldReport?.length > 1 ? `${t("BPA_FI_REPORT")}-${index + 1}` : `${t("BPA_FI_REPORT")}`}</CardSectionHeader>
                    {/* <LabelFieldPair style={{ width: "100%" }}>
                        <CardLabel style={{ marginTop: "0px", width: "100%" }} className="card-label-smaller">{`${t("BPA_FI_DATE_LABEL")} * `}</CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                            <Controller
                                name="InspectionDate"
                                rules={{ required: t("REQUIRED_FIELD") }}
                                control={control}
                                render={(props) => (
                                    <DatePicker
                                        date={props.value}
                                        name="InspectionDate"
                                        onChange={props.onChange}
                                        max={today}
                                    />
                                )}
                            />
                        </div>
                    </LabelFieldPair>
                    <LabelFieldPair style={{ width: "100%" }}>
                        <CardLabel style={{ marginTop: "0px", width: "100%" }} className="card-label-smaller">{`${t("ES_COMMON_TIME")} * `}</CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                            <Controller
                                name="InspectionTime"
                                rules={{ required: t("REQUIRED_FIELD") }}
                                control={control}
                                render={(props) => (
                                    <TextInput
                                        name="InspectionTime"
                                        type="time"
                                        value={props.value}
                                        onChange={props.onChange}
                                    />
                                )}
                            />
                        </div>
                    </LabelFieldPair> */}
                    {/* <CardSectionHeader>{t("BPA_CHECK_LIST_DETAILS")}</CardSectionHeader> */}
                    {/* {questionList && questionList.map((ob, ind) => (
                        <div key={ind}> */}
                            {/* <LabelFieldPair >
                                <CardLabel  className="card-label-smaller">{`${t(ob.question)}`}</CardLabel>
                                <div className="field" >
                                    <Controller
                                        control={control}
                                        name={`question_${ind}`}
                                        //rules={{ required: t("REQUIRED_FIELD") }}
                                        render={(props) => (
                                            <Dropdown
                                                className="form-field"
                                                style={{ width: "100%", maxWidth: "100%" }}
                                                selected={getValues(`question${ind}`)}
                                                disable={false}
                                                option={getOptions(ob.fieldType)}
                                                select={(e) => {
                                                    if (props?.value?.code == e?.code) return true;
                                                    props.onChange(e);
                                                }}
                                                optionKey="i18nKey"
                                                onBlur={props.onBlur}
                                                t={t}
                                            />
                                        )}
                                    />
                                </div>
                            </LabelFieldPair>
                            <LabelFieldPair >
                                <CardLabel className="card-label-smaller">{t("BPA_ENTER_REMARKS")}</CardLabel>
                                <div className="field">
                                    <Controller
                                        control={control}
                                        name={`Remarks_${ind}`}
                                        defaultValue={unit?.uomValue}
                                        render={(props) => (
                                            <TextInput
                                                value={getValues(`Remarks${ind}`)}
                                                onChange={(e) => {
                                                    props.onChange(e);
                                                }}
                                                onBlur={props.onBlur}
                                            />
                                        )}
                                    />
                                </div>
                            </LabelFieldPair> */}
                            {/* <CardLabel className="card-label-smaller">{`${t(ob.question)}`}</CardLabel>
                            <Controller
                                control={control}
                                name={`Remarks_${ind}`}
                                defaultValue={unit?.uomValue}
                                render={(props) => (
                                    <TextInput
                                        value={getValues(`Remarks${ind}`)}
                                        onChange={(e) => {
                                            props.onChange(e);
                                        }}
                                        placeholder={t("BPA_ENTER_REMARKS")}
                                        onBlur={props.onBlur}
                                    />
                                )}
                            />
                        </div>
                    ))} */}                
                    <div className="bpa-table-container">
                        <table className="customTable table-border-style">
                            <thead>
                                <tr>
                                    <th>{t("BPA_CHECK_LIST_DETAILS")}</th>
                                    <th>{t("BPA_REMARKS")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questionList && questionList.map((ob, ind) => (
                                    <tr key={ind}>
                                        <td>{t(ob?.question)|| t("CS_NA")}</td>
                                        <td>
                                            <Controller
                                                control={control}
                                                name={`Remarks_${ind}`}
                                                defaultValue={unit?.uomValue}
                                                rules={applicationStatus === "INSPECTION_REPORT_PENDING" ? { required: t("REQUIRED_FIELD") } : {}}
                                                render={(props) => (
                                                    <TextInput
                                                        value={getValues(`Remarks_${ind}`)}
                                                        onChange={(e) => {
                                                            props.onChange(e);
                                                        }}
                                                        placeholder={t("BPA_ENTER_REMARKS")}
                                                        onBlur={props.onBlur}
                                                    />
                                                )}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* <CardSectionHeader style={{ marginTop: "20px" }}>{t("BPA_FIELD_INSPECTION_DOCUMENTS")}</CardSectionHeader> */}
                    {/* <OBPSDocumentsEmp t={t} config={config} onSelect={onSelect} userType={userType} formData={formData} setError={setError} clearErrors={clearErrors} formState={formState} index={index} setFieldReports={setFieldReports} documentList={documentList} /> */}
                    {/* <Table
                        className="customTable table-border-style"
                        t={t}
                        data={documentData}
                        columns={documentsColumns}
                        getCellProps={() => ({ style: {} })}
                        disableSort={false}
                        autoSort={true}
                        manualPagination={false}
                        isPaginationRequired={false}
                    /> */}
            {/* </div> */}
         </React.Fragment>
    );
};

export default InspectionReport;