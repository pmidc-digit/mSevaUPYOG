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

const LayoutCLUDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const [selectedIsCluApproved, setSelectedIsCluApproved] = useState(currentStepData?.siteDetails?.cluIsApproved || []);

  const cluOptions = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ];

  useEffect(() => {
    console.log("currentStepData4", currentStepData);
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      //console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);


  return (
    <React.Fragment>
      <CardSectionHeader>{t("BPA_CLU_DETAILS")}</CardSectionHeader>

      <div style={{marginBottom:"16px"}}>
        
        <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_IS_CLU_REQUIRED_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          
        <Controller
          control={control}
          name={"cluIsApproved"}
          rules={{ required: t("REQUIRED_FIELD") }}
          render={(props) => (
          <Dropdown 
          t={t}
            className="form-field" 
            select={(e)=>{
              props.onChange(e);
              setSelectedIsCluApproved(e);
            }} 
            selected={props.value} 
            option={cluOptions}
            optionKey="i18nKey" />
            
            
            )}
            />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>
            {errors?.cluIsApproved?.message || ""}
        </CardLabelError>


        {selectedIsCluApproved.code === "YES" && (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_CLU_APPROVED_NUMBER_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="cluNumber"
              rules={{
                required: t("REQUIRED_FIELD"),
                minLength: {
                  value: 4,
                  message: t("MIN_4_CHARACTERS_REQUIRED"),
                },
                maxLength: {
                  value: 100,
                  message: t("MAX_100_CHARACTERS_ALLOWED"),
                },
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
        <CardLabelError style={errorStyle}>{errors?.cluNumber?.message || ""}</CardLabelError>

      </div>
    </React.Fragment>
  );
};

export default LayoutCLUDetails;
