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

const CLUSpecificationDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

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
      <CardSectionHeader>{t("BPA_SPECIFICATION_DETAILS")}</CardSectionHeader>

      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_PLOT_AREA_JAMA_BANDI_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="specificationPlotArea"
              rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
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
                  disable={currentStepData?.apiData?.Clu?.[0]?.applicationNo ? true: false}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.specificationPlotArea ? errors.specificationPlotArea.message : ""}</CardLabelError>
      </div>
    </React.Fragment>
  );
};

export default CLUSpecificationDetails;
