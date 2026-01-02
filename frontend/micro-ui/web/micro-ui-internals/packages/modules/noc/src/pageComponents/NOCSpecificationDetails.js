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

const NOCSpecificationDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [selectedBuildingCategory, setSelectedBuildingCategory] = useState(currentStepData?.siteDetails?.specificationBuildingCategory || null);

  const { data: buildingCategory, isLoading: isLoading, error: buildingCategoryError } = Digit.Hooks.noc.useBuildingCategory(stateId);
  const { data: nocType, isLoading: isNocTypeLoading,  } = Digit.Hooks.noc.useNocType(stateId);

 // console.log("nocType here", nocType);

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
          <CardLabel className="card-label-smaller">{`${t("NOC_PLOT_AREA_JAMA_BANDI_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.specificationPlotArea ? errors.specificationPlotArea.message : ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_BUILDING_CATEGORY_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          {/* <div className="field"> */}
          {!isLoading && buildingCategory.length > 0 && (
            <Controller
              control={control}
              name={"specificationBuildingCategory"}
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={(e) => {
                    setSelectedBuildingCategory(e);
                    props.onChange(e);
                  }}
                  selected={props.value}
                  option={buildingCategory}
                  optionKey="name"
                  t={t}
                />
              )}
            />
          )}
          {/* </div> */}
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>
          {errors?.specificationBuildingCategory ? errors.specificationBuildingCategory.message : ""}
        </CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_NOC_TYPE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
            {!isNocTypeLoading && (
                <Controller
                  control={control}
                  name={"specificationNocType"}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                  }}
                  render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={nocType} optionKey="name" t={t}/>
              )}
              />
            )}
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.specificationNocType?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_RESTRICTED_AREA_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <Controller
            control={control}
            name={"specificationRestrictedArea"}
            rules={{
              required: t("REQUIRED_FIELD"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                select={props.onChange}
                selected={props.value}
                option={options}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.specificationRestrictedArea?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <Controller
            control={control}
            name={"specificationIsSiteUnderMasterPlan"}
            rules={{
              required: t("REQUIRED_FIELD"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                select={props.onChange}
                selected={props.value}
                option={options}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.specificationIsSiteUnderMasterPlan?.message || ""}</CardLabelError>
      </div>
    </React.Fragment>
  );
};

export default NOCSpecificationDetails;
