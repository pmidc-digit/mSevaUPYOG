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
} from "@mseva/digit-ui-react-components";

const NOCSpecificationDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [selectedBuildingCategory, setSelectedBuildingCategory] = useState(currentStepData?.siteDetails?.specificationBuildingCategory || []);

  const { data: buildingCategory, isLoading: isLoading, error: buildingCategoryError } = Digit.Hooks.noc.useBuildingCategory(stateId);

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
      <CardSectionHeader>{t("NOC_SPECIFICATION_DETAILS")}</CardSectionHeader>

      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_PLOT_AREA_JAMA_BANDI_LABEL")}`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="specificationPlotArea"
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
        <CardLabelError style={errorStyle}>{errors?.specificationPlotArea ? errors.specificationPlotArea.message : ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_BUILDING_CATEGORY_LABEL")}`}*</CardLabel>
          {/* <div className="field"> */}
          {!isLoading && buildingCategory.length > 0 && (
            <Controller
              control={control}
              name={"specificationBuildingCategory"}
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <Dropdown className="form-field" select={props.onChange} selected={props.value} option={buildingCategory} optionKey="name" />
              )}
            />
          )}
          {/* </div> */}
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>
          {errors?.specificationBuildingCategory ? errors.specificationBuildingCategory.message : ""}
        </CardLabelError>
      </div>
    </React.Fragment>
  );
};

export default NOCSpecificationDetails;
