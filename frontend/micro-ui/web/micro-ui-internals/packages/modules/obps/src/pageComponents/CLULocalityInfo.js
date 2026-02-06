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

  const { data: areaTypeData} = Digit.Hooks.useCustomMDMS(stateId, "CLU", [{ name: "AreaType" }]);
  const areaTypeOptions = areaTypeData?.CLU?.AreaType || [];

  const { data: colonyTypeData } = Digit.Hooks.useCustomMDMS(stateId, "CLU", [{ name: "SchemeType" }]);
  const colonyTypeOptions = colonyTypeData?.CLU?.SchemeType || [];

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


  return (
    <React.Fragment>
      <CardSectionHeader>{t("BPA_LOCALITY_INFO_LABEL")}</CardSectionHeader>

      <div>
        <LabelFieldPair style={{ marginBottom: "20px" }}>
          <CardLabel className="card-label-smaller">{`${t("BPA_AREA_TYPE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          {areaTypeOptions.length > 0 && (
            <div className="field">
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
                  option={areaTypeOptions}
                  optionKey="name"
                  t={t}
                />
              )}
            />
            <p style={errorStyle}>{errors?.localityAreaType?.message}</p>
            </div>
          )}
        </LabelFieldPair>
        
        {selectedAreaType?.code === "SCHEME_AREA" && 
         <LabelFieldPair style={{ marginBottom: "20px" }}>
          <CardLabel className="card-label-smaller">{`${t("BPA_SCHEME_COLONY_TYPE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <div className="field">
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
          <p style={errorStyle}>{errors?.localityColonyType?.message}</p>
          </div>
         </LabelFieldPair>
         }

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
              <p style={errorStyle}>{errors?.localitySchemeName?.message}</p>
            </div>
          </LabelFieldPair>
        )}

      </div>
      <BreakLine />
    </React.Fragment>
  );
};

export default CLULocalityInfo;
