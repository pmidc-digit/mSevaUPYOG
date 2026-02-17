import React, { useEffect, useState } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  Loader,
  CardLabelError,
  UploadFile,
} from "@mseva/digit-ui-react-components";

const CLULocalityInfo = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [selectedAreaType, setSelectedAreaType] = useState(currentStepData?.siteDetails?.localityAreaType || []);
  const [nonSchemeType, setNonSchemeType] = useState(currentStepData?.siteDetails?.localityNonSchemeType || []);
  const [noticeIssued, setNoticeIssued] = useState(currentStepData?.siteDetails?.localityNoticeIssued || null);

  const options = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ];

  const { data: mdmsData } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);

  //console.log("mdmsData ==>", mdmsData);
  const areaTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.areaType || [];
  const nonSchemeTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.nonSchemeType || [];

  const { data: colonyTypeData } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "ColonyType" }]);
  const colonyTypeOptions = colonyTypeData?.BPA?.ColonyType || [];

  const { data: transferredSchemeTypeData } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "TransferredSchemeType" }]);
  const transferredSchemeTypeOptions = transferredSchemeTypeData?.BPA?.TransferredSchemeType || [];

  useEffect(() => {
    //console.log("currentStepData4", currentStepData);
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      //console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        if (key !== "floorArea") setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  useEffect(() => {
    if (selectedAreaType?.code === "NON_SCHEME") {
      setNonSchemeType(nonSchemeTypeOptions);
    } else {
      setNonSchemeType(null);
      // setValue("layoutNonSchemeType", null);
    }
  }, [selectedAreaType, nonSchemeTypeOptions]);

  return (
    <React.Fragment>
      <CardSectionHeader>{t("BPA_LOCALITY_INFO_LABEL")}</CardSectionHeader>

      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_AREA_TYPE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          {areaTypeOptions.length > 0 && (
            <Controller
              control={control}
              name={"localityAreaType"}
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                    setSelectedAreaType(e);
                  }}
                  selected={props.value}
                  option={areaTypeOptions?.filter((item)=> !(item.code === "APPROVED_COLONY"))}
                  optionKey="name"
                  t={t}
                />
              )}
            />
          )}
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.localityAreaType ? errors.localityAreaType.message : ""}</CardLabelError>

        {selectedAreaType?.code === "SCHEME_AREA" && (
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_SCHEME_NAME_LABEL")}`}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="localitySchemeName"
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    t={t}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
        )}
        <CardLabelError style={errorStyle}>{errors?.localitySchemeName?.message || ""}</CardLabelError>

        {/* {selectedAreaType?.code === "APPROVED_COLONY" && (
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_APPROVED_COLONY_NAME_LABEL")}`}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="localityApprovedColonyName"
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    t={t}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
        )}
        <CardLabelError style={errorStyle}>{errors?.localityApprovedColonyName?.message || ""}</CardLabelError> */}

        {selectedAreaType?.code === "NON_SCHEME" && (
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NON_SCHEME_TYPE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
            <Controller
              control={control}
              name={"localityNonSchemeType"}
              rules={{
                required: t("REQUIRED_FIELD"),
              }}
              render={(props) => (
                <Dropdown className="form-field" select={props.onChange} selected={props.value} option={nonSchemeTypeOptions} optionKey="name" t={t}/>
              )}
            />
          </LabelFieldPair>
        )}
        <CardLabelError style={errorStyle}>{errors?.localityNonSchemeType?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_NOTICE_ISSUED_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <Controller
            control={control}
            name={"localityNoticeIssued"}
            rules={{
              required: t("REQUIRED_FIELD"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                select={(e) => {
                  setNoticeIssued(e);
                  props.onChange(e);
                }}
                selected={props.value}
                option={options}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.localityNoticeIssued?.message || ""}</CardLabelError>

        {noticeIssued?.code === "YES" && (
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NOTICE_NUMBER_LABEL")}`}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="localityNoticeNumber"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
        )}
        <CardLabelError style={errorStyle}>{errors?.localityNoticeNumber?.message || ""}</CardLabelError>
        
        {selectedAreaType?.code === "SCHEME_AREA" && 
         <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_SCHEME_COLONY_TYPE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <Controller
            control={control}
            name={"localityColonyType"}
            rules={{
              required: t("REQUIRED_FIELD"),
            }}
            render={(props) => (
              <Dropdown className="form-field" select={props.onChange} selected={props.value} option={colonyTypeOptions} optionKey="name" t={t}/>
            )}
          />
         </LabelFieldPair>
         }
        <CardLabelError style={errorStyle}>{errors?.localityColonyType?.message || ""}</CardLabelError>
        

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_TRANSFERRED_SCHEME_TYPE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <Controller
            control={control}
            name={"localityTransferredSchemeType"}
            rules={{
              required: t("REQUIRED_FIELD"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                select={props.onChange}
                selected={props.value}
                option={transferredSchemeTypeOptions}
                optionKey="name"
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.localityTransferredSchemeType?.message || ""}</CardLabelError>

      </div>
      <BreakLine />
    </React.Fragment>
  );
};

export default CLULocalityInfo;
