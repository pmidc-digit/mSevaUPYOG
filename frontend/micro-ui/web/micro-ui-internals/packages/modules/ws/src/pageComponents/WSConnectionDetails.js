import { CardLabel, Dropdown, LabelFieldPair, Loader, TextInput, CardLabelError, CheckBox } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { getPattern, stringReplaceAll } from "../utils";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import cloneDeep from "lodash/cloneDeep";
import { constants } from "../constants/constants";
import { useSelector } from "react-redux";
import { TENANT_IDS } from "../../../../constants/constants";

const createConnectionDetails = () => ({
  water: true,
  sewerage: false,
  //For water
  proposedPipeSize: "",
  proposedTaps: "",
  //For sewerage
  proposedToilets: "",
  proposedWaterClosets: "",
  //Common for water & sewerage (Confirm once)
  connectionType: "",
  waterSource: "",
  billingType: "",
  connectionCategory: "",
  subUsageType: "",
  ledgerIdOrArea: "",
  billingAmount: "",
  group: "",
});

const WSConnectionDetails = ({ config, onSelect, formData, setError, formState, clearErrors }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  //For form
  const [connectionDetails, setConnectionDetails] = useState(
    formData?.ConnectionDetails ? [formData?.ConnectionDetails?.[0]] : [createConnectionDetails()]
  );
  const [isErrors, setIsErrors] = useState(false);
  const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });
  //For dropdowns
  const [pipeSizeList, setPipesizeList] = useState([]);
  const [connectionTypeList, setConnectionTypeList] = useState([]);
  const [waterSourceList, setWaterSourceList] = useState([]);
  const [billingTypeList, setBillingTypeList] = useState([]);
  const [connectionCategoryList, setConnectionCategoryList] = useState([]);
  const [subUsageTypeList, setSubUsageTypeList] = useState([]);
  const [groupList, setGroupList] = useState([]);

  const { isWSServicesCalculationLoading, data: wsServicesCalculationData } = Digit.Hooks.ws.useMDMS(tenantId, "ws-services-calculation", [
    "PipeSize",
  ]);
  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.ws.useMDMS(tenantId, "ws-services-masters", [
    "connectionType",
    "waterSource",
    "billingType",
    "connectionCategory",
    "subUsageType",
    "groups",
  ]);

  useEffect(() => {
    const list = wsServicesCalculationData?.["ws-services-calculation"]?.PipeSize || [];
    list?.forEach((data) => (data.i18nKey = data.size));
    setPipesizeList(list);

    const connectionTypes = mdmsData?.["ws-services-masters"]?.connectionType || [];
    connectionTypes?.forEach((data) => (data.i18nKey = `WS_CONNECTIONTYPE_${stringReplaceAll(data?.code?.toUpperCase(), " ", "_")}`));
    setConnectionTypeList(connectionTypes);

    const waterSource = (mdmsData?.["ws-services-masters"]?.waterSource && cloneDeep(mdmsData?.["ws-services-masters"]?.waterSource)) || [];
    waterSource?.forEach(
      (data) => (data.i18nKey = `WS_SERVICES_MASTERS_WATERSOURCE_${stringReplaceAll(data?.code?.split(".")[0]?.toUpperCase(), " ", "_")}`)
    );
    var flags = [],
      waterSourceOutput = [],
      l = waterSource.length,
      i;
    for (i = 0; i < l; i++) {
      if (flags[waterSource[i].i18nKey]) continue;
      flags[waterSource[i].i18nKey] = true;
      waterSourceOutput.push({
        i18nKey: waterSource?.[i]?.i18nKey,
        code: waterSource?.[i]?.code,
        // waterSubSource: waterSource?.[i]?.code?.split(".")[0]
      });
    }
    setWaterSourceList(waterSourceOutput);

    const billingTypes = mdmsData?.["ws-services-masters"]?.billingType || [];
    billingTypes?.forEach((data) => (data.i18nKey = `WS_BILLINGTYPE_${stringReplaceAll(data?.code?.toUpperCase(), " ", "_")}`));
    setBillingTypeList(billingTypes);

    const connectionCategories = mdmsData?.["ws-services-masters"]?.connectionCategory || [];
    connectionCategories?.forEach((data) => (data.i18nKey = `WS_CONNECTIONCATEGORY_${stringReplaceAll(data?.code?.toUpperCase(), " ", "_")}`));
    setConnectionCategoryList(connectionCategories);

    const propertyDetails = JSON.parse(sessionStorage.getItem("wsProperty"));
    const subUsageType = mdmsData?.["ws-services-masters"]?.subUsageType || [];
    subUsageType?.forEach((data) => (data.i18nKey = data?.code?.toUpperCase()));
    const parentUsageType = propertyDetails?.usageCategory;
    const subUsageTypeList = subUsageType.filter((item) => item.parentUsageType === parentUsageType);
    console.log("subUsageTypeList", subUsageType, parentUsageType, propertyDetails);
    setSubUsageTypeList(subUsageTypeList);

    const groups = mdmsData?.["ws-services-masters"]?.groups || [];
    groups?.forEach((data) => (data.i18nKey = data?.code?.toUpperCase()));
    setGroupList(groups);
  }, [wsServicesCalculationData, mdmsData]);

  useEffect(() => {
    console.log("connectionDetails in WSConnectionDetails:", connectionDetails);
    onSelect(config?.key, connectionDetails);
    //onSelect(config.key, { ...formData[config.key], ...connectionDetails });
  }, [connectionDetails]);

  const allStepsData = useSelector((state) => state.ws.newWSApplicationForm.formData);

  useEffect(() => {
    const applyingFor = allStepsData.connectionDetails.ApplyingFor;
    const currApplyingFor = { water: connectionDetails?.[0]?.water, sewerage: connectionDetails?.[0]?.sewerage };
    console.log("1)allStepsData: ", allStepsData, applyingFor, currApplyingFor);
    if (!_.isEqual(applyingFor, currApplyingFor)) {
      console.log("2)allStepsData: ", allStepsData, applyingFor, currApplyingFor);
      setConnectionDetails((prevDetails) => {
        const updatedDetails = [...prevDetails];
        updatedDetails[0] = {
          ...updatedDetails[0],
          water: applyingFor.water,
          sewerage: applyingFor.sewerage,
          proposedPipeSize: applyingFor.water ? updatedDetails[0].proposedPipeSize : "",
          proposedTaps: applyingFor.water ? updatedDetails[0].proposedTaps : "",
          proposedToilets: applyingFor.sewerage ? updatedDetails[0].proposedToilets : "",
          proposedWaterClosets: applyingFor.sewerage ? updatedDetails[0].proposedWaterClosets : "",
        };
        return updatedDetails;
      });
    }
  }, [allStepsData]);

  if (isWSServicesCalculationLoading || isMdmsLoading) return <Loader />;

  const commonProps = {
    focusIndex,
    connectionDetails,
    setFocusIndex,
    formData,
    formState,
    t,
    setError,
    clearErrors,
    config,
    setConnectionDetails,
    setIsErrors,
    isErrors,
    pipeSizeList,
    connectionTypeList,
    waterSourceList,
    billingTypeList,
    connectionCategoryList,
    subUsageTypeList,
    groupList,
    formData,
    tenantId
  };

  console.log("Billing details translation: ", t("WS_SERV_DETAIL_BILLING_TYPE"));
  return (
    <React.Fragment>
      {connectionDetails.map((connectionDetail, index) => (
        <ConnectionDetails key={connectionDetail.key} index={index} connectionDetail={connectionDetail} {...commonProps} />
      ))}
    </React.Fragment>
  );
};

const ConnectionDetails = (_props) => {
  const {
    connectionDetail,
    focusIndex,
    setFocusIndex,
    t,
    config,
    setError,
    clearErrors,
    formState,
    setIsErrors,
    isErrors,
    connectionTypeList,
    waterSourceList,
    billingTypeList,
    connectionCategoryList,
    subUsageTypeList,
    groupList,
    setConnectionDetails,
    pipeSizeList,
    connectionDetails,
    formData,
    tenantId
  } = _props;

  const {
    control,
    formState: localFormState,
    watch,
    setError: setLocalError,
    clearErrors: clearLocalErrors,
    setValue,
    trigger,
    getValues,
  } = useForm();
  const formValue = watch();
  const { errors } = localFormState;

  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    if (Object.entries(formValue).length > 0) {
      const keys = Object.keys(formValue);
      const part = {};
      keys.forEach((key) => (part[key] = connectionDetail[key]));
      if (!_.isEqual(formValue, part)) {
        let isErrorsFound = true;
        Object.keys(formValue).map((data) => {
          if (!formValue[data] && isErrorsFound) {
            isErrorsFound = false;
            setIsErrors(false);
          }
        });
        if (isErrorsFound) setIsErrors(true);
        let ob = [{ ...formValue }];
        setConnectionDetails(ob);
        trigger();
      }
    }
  }, [formValue, connectionDetails]);

  useEffect(() => {
    let isClear = true;
    Object.keys(connectionDetails?.[0])?.map((data) => {
      if (!connectionDetails[0][data] && connectionDetails[0][data] != false && isClear) isClear = false;
    });
    if (isClear && Object.keys(connectionDetails?.[0])?.length > 1) {
      clearErrors("ConnectionDetails");
    }

    if (!connectionDetails?.[0]?.sewerage) {
      clearErrors(config.key, { type: "proposedToilets" });
      clearErrors(config.key, { type: "proposedWaterClosets" });
    }

    if (!connectionDetails?.[0]?.water) {
      clearErrors(config.key, { type: "proposedPipeSize" });
      clearErrors(config.key, { type: "proposedTaps" });
    }
    trigger();
  }, [connectionDetails, formData?.DocumentsRequired?.documents]);

  useEffect(() => {
    if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) {
      setError(config.key, { type: errors });
    } else if (!Object.keys(errors).length && formState.errors[config.key] && isErrors) {
      clearErrors(config.key);
    }
  }, [errors]);

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
  const isMobile = window.Digit.Utils.browser.isMobile();
  const isEmployee = window.location.href.includes("/employee");
  const titleStyle = isMobile
    ? { marginBottom: "40px", color: "#505A5F", fontWeight: "700", fontSize: "16px" }
    : { marginTop: "-40px", marginBottom: "40px", color: "#505A5F", fontWeight: "700", fontSize: "16px" };

  const isConnectionTypeMetered = getValues("connectionType")?.code?.toUpperCase() === constants.WS_CONNECTION_TYPE_METERED_CODE.toUpperCase();
  const isBillingTypeCustom = getValues("billingType")?.code?.toUpperCase() === constants.WS_BILLING_TYPE_CUSTOM_CODE.toUpperCase();
  const displayBillingAmount = !isConnectionTypeMetered && isBillingTypeCustom;
  const disableBillingType = isConnectionTypeMetered;
  //console.log(getValues("connectionType"));
  useEffect(() => {
    console.log("Inside useEffect");
    if (isConnectionTypeMetered && billingTypeList.length > 0) {
      console.log("Inside useEffect if condition. Billing Type List: ", billingTypeList);
      setValue(
        "billingType",
        billingTypeList.find((item) => item?.code?.toUpperCase() === constants.WS_BILLING_TYPE_STANDARD_CODE.toUpperCase())
      );
    }
  }, [isConnectionTypeMetered, billingTypeList]);

  useEffect(() => {
    console.log("isBillingTypeCustom: ", isBillingTypeCustom);
    if (!isBillingTypeCustom) {
      console.log("!isBillingTypeCustom");
      setValue("billingAmount", "");
    }
  }, [isBillingTypeCustom]);

  const isTenantPatiala=(tenantId===TENANT_IDS.PATIALA);

  return (
    <div>
      {/* {window.location.href.includes("/ws/new") ?  <div style={titleStyle}>{t("WS_CONNECTION_DETAILS_HEADER_SUB_TEXT_LABEL")}</div> : null} */}
      <div style={{ marginBottom: "16px" }}>
        {connectionDetail?.water && (
          <div>
            <LabelFieldPair>
              <CardLabel
                style={isMobile && isEmployee ? { fontWeight: "700", width: "100%" } : { marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_SERV_DETAIL_NO_OF_TAPS")}*`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="proposedTaps"
                  defaultValue={connectionDetail?.proposedTaps}
                  rules={{
                    validate: (e) => ((parseInt(e) > 0 && e && getPattern("WSOnlyNumbers").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
                    required: t("REQUIRED_FIELD"),
                  }}
                  type="number"
                  isMandatory={true}
                  render={(props) => (
                    <TextInput
                      type="number"
                      value={props.value}
                      autoFocus={focusIndex.index === connectionDetail?.key && focusIndex.type === "proposedTaps"}
                      errorStyle={localFormState.touched.proposedTaps && errors?.proposedTaps?.message ? true : false}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({ index: connectionDetail?.key, type: "proposedTaps" });
                      }}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.proposedTaps ? errors?.proposedTaps?.message : ""}</CardLabelError>
            <LabelFieldPair>
              <CardLabel
                style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_SERV_DETAIL_PIPE_SIZE")}*`}</CardLabel>
              <Controller
                control={control}
                name={"proposedPipeSize"}
                defaultValue={connectionDetail?.proposedPipeSize}
                rules={{ required: t("REQUIRED_FIELD") }}
                isMandatory={true}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={getValues("proposedPipeSize")}
                    disable={false}
                    option={pipeSizeList}
                    errorStyle={localFormState.touched.proposedPipeSize && errors?.proposedPipeSize?.message ? true : false}
                    select={(e) => {
                      props.onChange(e);
                      setFocusIndex({ index: connectionDetail?.key, type: "proposedPipeSize" });
                    }}
                    optionKey="i18nKey"
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.proposedPipeSize ? errors?.proposedPipeSize?.message : ""}</CardLabelError>
            {/*  */}
            <LabelFieldPair>
              <CardLabel
                style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_SERV_DETAIL_CONN_TYPE")}*`}</CardLabel>
              <Controller
                control={control}
                name={"connectionType"}
                defaultValue={connectionDetail?.connectionType}
                rules={{ required: t("REQUIRED_FIELD") }}
                isMandatory={true}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={getValues("connectionType")}
                    disable={false}
                    option={connectionTypeList}
                    errorStyle={localFormState.touched.connectionType && errors?.connectionType?.message ? true : false}
                    select={(e) => {
                      props.onChange(e);
                      setFocusIndex({ index: connectionDetail?.key, type: "connectionType" });
                    }}
                    optionKey="i18nKey"
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.connectionType ? errors?.connectionType?.message : ""}</CardLabelError>
            {/*  */}
            <LabelFieldPair>
              <CardLabel
                style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_SERV_DETAIL_WATER_SOURCE")}`}</CardLabel>
              <Controller
                control={control}
                name={"waterSource"}
                defaultValue={connectionDetail?.waterSource}
                //rules={{ required: t("REQUIRED_FIELD") }}
                isMandatory={false}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    selected={getValues("waterSource")}
                    disable={false}
                    option={waterSourceList}
                    errorStyle={localFormState.touched.waterSource && errors?.waterSource?.message ? true : false}
                    select={(e) => {
                      // let obj = { ...connectionDetails?.[0], waterSource: e?.code, waterSubSource: "" };
                      // setConnectionDetails([obj]);
                      // const waterSubSourceData =
                      //   (mdmsData?.["ws-services-masters"]?.waterSource && cloneDeep(mdmsData?.["ws-services-masters"]?.waterSource)) || [];
                      // waterSubSourceData?.forEach(
                      //   (data) => (data.i18nKey = `WS_SERVICES_MASTERS_WATERSOURCE_${stringReplaceAll(data?.code?.toUpperCase(), ".", "_")}`)
                      // );
                      // const listOfSubSource = waterSubSourceData?.filter((data) => e?.code?.split(".")[0] == data?.code?.split(".")[0]);
                      // setWaterSubSourceList(listOfSubSource);
                      props.onChange(e);
                      setFocusIndex({ index: connectionDetail?.key, type: "waterSource" });
                    }}
                    optionKey="i18nKey"
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.waterSource ? errors?.waterSource?.message : ""}</CardLabelError>
          </div>
        )}
        {/*  */}
        <LabelFieldPair>
          <CardLabel
            style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
            className="card-label-smaller"
          >{`${t("WS_SERV_DETAIL_BILLING_TYPE")}*`}</CardLabel>
          <Controller
            control={control}
            name={"billingType"}
            defaultValue={connectionDetail?.billingType}
            rules={{ required: t("REQUIRED_FIELD") }}
            isMandatory={true}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={getValues("billingType")}
                disable={disableBillingType}
                option={billingTypeList}
                errorStyle={localFormState.touched.billingType && errors?.billingType?.message ? true : false}
                select={(e) => {
                  props.onChange(e);
                  setFocusIndex({ index: connectionDetail?.key, type: "billingType" });
                }}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.billingType ? errors?.billingType?.message : ""}</CardLabelError>
        {/*  */}
        {displayBillingAmount && (
          <div>
            <LabelFieldPair>
              <CardLabel
                style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_SERV_DETAIL_BILLING_AMOUNT")}`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="billingAmount"
                  //defaultValue={connectionDetail?.billingAmount}
                  // rules={{
                  //   validate: (e) => ((parseInt(e) > 0 && e && getPattern("WSOnlyNumbers").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
                  //   required: t("REQUIRED_FIELD"),
                  // }}
                  // type="number"
                  isMandatory={false}
                  render={(props) => (
                    <TextInput
                      //type="number"
                      value={props.value} //{getValues("billingAmount")}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                      autoFocus={focusIndex.index === connectionDetail?.key && focusIndex.type === "billingAmount"}
                      errorStyle={localFormState.touched.billingAmount && errors?.billingAmount?.message ? true : false}
                      onChange={(e) => {
                        //setValue("billingAmount",e.target.value);
                        props.onChange(e.target.value);
                        setFocusIndex({ index: connectionDetail?.key, type: "billingAmount" });
                      }}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.billingAmount ? errors?.billingAmount?.message : ""}</CardLabelError>
          </div>
        )}
        {/*  */}
        <LabelFieldPair>
          <CardLabel
            style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
            className="card-label-smaller"
          >{`${t("WS_SERV_DETAIL_CONN_CATEGORY")}*`}</CardLabel>
          <Controller
            control={control}
            name={"connectionCategory"}
            defaultValue={connectionDetail?.connectionCategory}
            rules={{ required: t("REQUIRED_FIELD") }}
            isMandatory={true}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={getValues("connectionCategory")}
                disable={false}
                option={connectionCategoryList}
                errorStyle={localFormState.touched.connectionCategory && errors?.connectionCategory?.message ? true : false}
                select={(e) => {
                  props.onChange(e);
                  setFocusIndex({ index: connectionDetail?.key, type: "connectionCategory" });
                }}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.connectionCategory ? errors?.connectionCategory?.message : ""}</CardLabelError>
        {/*  */}
        <LabelFieldPair>
          <CardLabel
            style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
            className="card-label-smaller"
          >{`${t("WS_SERV_DETAIL_LEDGER_ID")}/ ${t("WS_AREA")}`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="ledgerIdOrArea"
              defaultValue={connectionDetail?.ledgerIdOrArea}
              // rules={{
              //   validate: (e) => ((parseInt(e) > 0 && e && getPattern("WSOnlyNumbers").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
              //   required: t("REQUIRED_FIELD"),
              // }}
              // type="number"
              isMandatory={false}
              render={(props) => (
                <TextInput
                  //type="number"
                  value={props.value}
                  labelStyle={{ marginTop: "unset" }}
                  onBlur={props.onBlur}
                  autoFocus={focusIndex.index === connectionDetail?.key && focusIndex.type === "ledgerIdOrArea"}
                  errorStyle={localFormState.touched.ledgerIdOrArea && errors?.ledgerIdOrArea?.message ? true : false}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                    setFocusIndex({ index: connectionDetail?.key, type: "ledgerIdOrArea" });
                  }}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.ledgerIdOrArea ? errors?.ledgerIdOrArea?.message : ""}</CardLabelError>

        {/*  */}
        <LabelFieldPair>
          <CardLabel
            style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
            className="card-label-smaller"
          >{`${t("WS_SERV_DETAIL_SUB_USAGE_TYPE")}`}</CardLabel>
          <Controller
            control={control}
            name={"subUsageType"}
            defaultValue={connectionDetail?.subUsageType}
            //rules={{ required: t("REQUIRED_FIELD") }}
            isMandatory={false}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={getValues("subUsageType")}
                disable={false}
                option={subUsageTypeList}
                errorStyle={localFormState.touched.subUsageType && errors?.subUsageType?.message ? true : false}
                select={(e) => {
                  props.onChange(e);
                  setFocusIndex({ index: connectionDetail?.key, type: "subUsageType" });
                }}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.subUsageType ? errors?.subUsageType?.message : ""}</CardLabelError>
        {/*  */}
        <LabelFieldPair>
          <CardLabel
            style={isMobile && isEmployee ? { fontWeight: "700", width: "100%", paddingTop: "10px" } : { marginTop: "-5px", fontWeight: "700" }}
            className="card-label-smaller"
          >{`${t("WS_GROUP_LABEL")}`}{isTenantPatiala?"*":""}</CardLabel>
          <Controller
            control={control}
            name={"group"}
            defaultValue={connectionDetail?.group}
            //rules={{ required: t("REQUIRED_FIELD") }}
            isMandatory={isTenantPatiala}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={getValues("group")}
                disable={false}
                option={groupList}
                errorStyle={localFormState.touched.group && errors?.group?.message ? true : false}
                select={(e) => {
                  props.onChange(e);
                  setFocusIndex({ index: connectionDetail?.key, type: "group" });
                }}
                optionKey="i18nKey"
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{localFormState.touched.group ? errors?.group?.message : ""}</CardLabelError>

        {connectionDetail?.sewerage && (
          <div>
            <LabelFieldPair>
              <CardLabel
                style={isMobile && isEmployee ? { fontWeight: "700", width: "100%" } : { marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_CONN_DETAIL_NO_OF_WATER_CLOSETS")}*`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="proposedWaterClosets"
                  defaultValue={connectionDetail?.proposedWaterClosets}
                  rules={{
                    validate: (e) => ((parseInt(e) > 0 && e && getPattern("WSOnlyNumbers").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
                    required: t("REQUIRED_FIELD"),
                  }}
                  type="number"
                  isMandatory={true}
                  render={(props) => (
                    <TextInput
                      type="number"
                      value={props.value}
                      autoFocus={focusIndex.index === connectionDetail?.key && focusIndex.type === "proposedWaterClosets"}
                      errorStyle={localFormState.touched.proposedWaterClosets && errors?.proposedWaterClosets?.message ? true : false}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({ index: connectionDetail?.key, type: "proposedWaterClosets" });
                      }}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>
              {localFormState.touched.proposedWaterClosets ? errors?.proposedWaterClosets?.message : ""}
            </CardLabelError>
            <LabelFieldPair>
              <CardLabel
                style={isMobile && isEmployee ? { fontWeight: "700", width: "100%" } : { marginTop: "-5px", fontWeight: "700" }}
                className="card-label-smaller"
              >{`${t("WS_ADDN_DETAILS_NO_OF_TOILETS")}*`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="proposedToilets"
                  defaultValue={connectionDetail?.proposedToilets}
                  rules={{
                    validate: (e) => ((parseInt(e) > 0 && e && getPattern("WSOnlyNumbers").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
                    required: t("REQUIRED_FIELD"),
                  }}
                  type="number"
                  isMandatory={true}
                  render={(props) => (
                    <TextInput
                      type="number"
                      value={props.value}
                      autoFocus={focusIndex.index === connectionDetail?.key && focusIndex.type === "proposedToilets"}
                      errorStyle={localFormState.touched.proposedToilets && errors?.proposedToilets?.message ? true : false}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                        setFocusIndex({ index: connectionDetail?.key, type: "proposedToilets" });
                      }}
                      labelStyle={{ marginTop: "unset" }}
                      onBlur={props.onBlur}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            <CardLabelError style={errorStyle}>{localFormState.touched.proposedToilets ? errors?.proposedToilets?.message : ""}</CardLabelError>
          </div>
        )}
      </div>
    </div>
  );
};

export default WSConnectionDetails;
