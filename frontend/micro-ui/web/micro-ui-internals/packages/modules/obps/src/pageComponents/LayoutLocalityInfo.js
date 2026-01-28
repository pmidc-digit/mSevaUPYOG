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
  UploadFile
} from "@mseva/digit-ui-react-components";

const LayoutLocalityInfo = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [selectedAreaType, setSelectedAreaType] = useState(currentStepData?.siteDetails?.layoutAreaType || []);
  const [nonSchemeType, setNonSchemeType]=useState(currentStepData?.siteDetails?.layoutNonSchemeType || []);


   const { data: mdmsData } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);
   
   const areaTypeOptions=mdmsData?.BPA?.LayoutType?.[0]?.areaType || [];
   const nonSchemeTypeOptions=mdmsData?.BPA?.LayoutType?.[0]?.nonSchemeType || [];


  useEffect(() => {
    console.log("currentStepData4", currentStepData);
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      //console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        if(key!== "floorArea")setValue(key, value);
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
          <CardLabel className="card-label-smaller">{`${t("BPA_AREA_TYPE_LABEL")}`}*</CardLabel>
          {areaTypeOptions.length > 0 && (
            <Controller
              control={control}
              name={"layoutAreaType"}
              rules={{ required: t("REQUIRED_FIELD") }}
              defaultValue={currentStepData?.siteDetails?.layoutAreaType || null}
              render={(props) => (
                <Dropdown 
                t={t}
                  className="form-field" 
                  select={(e)=>{
                    props.onChange(e);
                    setSelectedAreaType(e);
                  }} 
                  selected={props.value} 
                  option={areaTypeOptions}
                  optionKey="name" />
                  
              )}
            />
          )}
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>
          {errors?.layoutAreaType ? errors.layoutAreaType.message : ""}
        </CardLabelError>

        {selectedAreaType?.code === "SCHEME_AREA" && (
          <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_SCHEME_NAME_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="layoutSchemeName"
              defaultValue={currentStepData?.siteDetails?.schemeType?.name || ""}
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
        <CardLabelError style={errorStyle}>{errors?.layoutSchemeName?.message || ""}</CardLabelError>

        {selectedAreaType?.code === "APPROVED_COLONY" && (
          <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPROVED_COLONY_NAME_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="layoutApprovedColonyName"
               defaultValue={currentStepData?.siteDetails?.layoutApprovedColonyName || ""}
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
        <CardLabelError style={errorStyle}>{errors?.layoutApprovedColonyName?.message || ""}</CardLabelError>

        {selectedAreaType?.code === "NON_SCHEME" && (
           <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NON_SCHEME_TYPE_LABEL")}`}*</CardLabel>
              <Controller
                control={control}
                name={"layoutNonSchemeType"}
                defaultValue={currentStepData?.siteDetails?.layoutNonSchemeType || null}
                rules={{
                required: t("REQUIRED_FIELD"),
                
                }}
                render={(props) => (
                <Dropdown
                  className="form-field"
                  select={props.onChange}
                  selected={props.value}
                  option={nonSchemeTypeOptions}
                  optionKey="name"
                  t={t}
                  />
                )}
               />
              </LabelFieldPair>
               )}
          <CardLabelError style={errorStyle}>{errors?.layoutNonSchemeType?.message || ""}</CardLabelError>
      </div>
      <BreakLine />
    </React.Fragment>
  );
};

export default LayoutLocalityInfo;
