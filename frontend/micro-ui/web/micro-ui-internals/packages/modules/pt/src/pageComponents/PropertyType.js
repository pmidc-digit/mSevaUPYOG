import {
  CardLabel,
  CardLabelError,
  CitizenInfoLabel,
  Dropdown,
  FormStep,
  LabelFieldPair,
  Loader,
  RadioButtons,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { stringReplaceAll } from "../utils";
import Timeline from "../components/TLTimeline";
import { Controller, useForm } from "react-hook-form";

const PropertyType = ({ t, config, onSelect, userType, formData, setError, clearErrors, formState, onBlur }) => {

// console.log("formData???????????????????????",formData);


  const [BuildingType, setBuildingType] = useState(formData?.PropertyType);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const { data: Menu = {}, isLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "PTPropertyType") || {};
  let proptype = [];
  proptype = Menu?.PropertyTax?.PropertyType;
  let i;
  let menu = [];
 


  function getPropertyTypeMenu(proptype) {
    if (window.location.href.includes("employee") || window.location.href.includes("citizen")) {      
      return proptype
        ?.filter((e) => e.code === "VACANT" || e.code.split(".").length > 1)
        ?.map((item) => ({ i18nKey: "COMMON_PROPTYPE_" + stringReplaceAll(item?.code, ".", "_"), code: item?.code }))
        ?.sort((a, b) => a.i18nKey.split("_").pop().localeCompare(b.i18nKey.split("_").pop()));
    } else {
      if (Array.isArray(proptype) && proptype.length > 0) {
        for (i = 0; i < proptype.length; i++) {
          if (i != 1 && i != 4 && Array.isArray(proptype) && proptype.length > 0)
            menu.push({ i18nKey: "COMMON_PROPTYPE_" + stringReplaceAll(proptype[i].code, ".", "_"), code: proptype[i].code });
        }
      }
      menu.sort((a, b) => a.i18nKey.split("_").pop().localeCompare(b.i18nKey.split("_").pop()));
      return menu;
    }
  }

  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify");

  const onSkip = () => onSelect();

  function selectBuildingType(value) {
    setBuildingType(value);
  }

  function goNext() {
    sessionStorage.setItem("PropertyType", BuildingType);
    onSelect(config.key, BuildingType);
  }

  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue } = useForm();
  const formValue = watch();
  const { errors } = localFormState;
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
  useEffect(() => {
    if (window.location.href.includes("citizen")) {
      let keys = Object.keys(formValue);
      const part = {};
      keys.forEach((key) => (part[key] = formData[config.key]?.[key]));
      if (!_.isEqual(formValue, part)) onSelect(config.key, { ...formData[config.key], ...formValue });
      for (let key in formValue) {
        if (!formValue[key] && !localFormState?.errors[key]) {
          setLocalError(key, { type: `${key.toUpperCase()}_REQUIRED`, message: t(`CORE_COMMON_REQUIRED_ERRMSG`) });
        } else if (formValue[key] && localFormState.errors[key]) {
          clearLocalErrors([key]);
        }
      }
    }
  }, [formValue]);

  useEffect(() => {
    if (window.location.href.includes("citizen")) {
      const errorsPresent = !!Object.keys(localFormState.errors).lengtha;
      if (errorsPresent && !formState.errors?.[config.key]) setError(config.key, { type: "required" });
      else if (!errorsPresent && formState.errors?.[config.key]) clearErrors(config.key);
    }
  }, [localFormState]);
  useEffect(() => {
    if (presentInModifyApplication && (window.location.href.includes("employee")||window.location.href.includes("citizen")) && Menu) {
      const original = formData?.PropertyType?.code;
      const defaultVal = getPropertyTypeMenu(proptype)?.filter((e) => e.code === original)[0];
      setBuildingType(defaultVal);
    }
  }, [isLoading]);

  useEffect(() => {
    if (window.location.href.includes("employee") || window.location.href.includes("citizen")) {
      goNext();
      if (!BuildingType) setError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
      else clearErrors(config.key);
    }
  }, [BuildingType]);

  useEffect(() => {
    if (formData?.PropertyType?.code && getPropertyTypeMenu(proptype)?.length) {
      const code = formData?.PropertyType?.code;
      const builtdingtype = getPropertyTypeMenu(proptype)?.find((e) => e.code === code);
      setValue("PropertyType", builtdingtype);
    }
  }, [formData]);

  const inputs = [
    {
      label: "PT_ASSESMENT_INFO_TYPE_OF_BUILDING",
      type: "text",
      name: "propertyType",
      validation: {},
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  // console.log("getPropertyTypeMenu(proptype)",getPropertyTypeMenu(proptype));
  console.log("localFormState",localFormState?.errors)
  if (window.location.href.includes("employee")) {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment key={index}>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t(input.label)} {config.isMandatory && <span style={{ color: 'red' }}>*</span>}</CardLabel>
            {/* <Dropdown
              className="form-field"
              selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : BuildingType}
              disable={getPropertyTypeMenu(proptype)?.length === 1}
              option={getPropertyTypeMenu(proptype)}
              select={selectBuildingType}
              optionKey="i18nKey"
              onBlur={onBlur}
              t={t}
            /> */}
            <Controller
              name="PropertyType"
              // defaultValue={BuildingType}
              control={control}
              rules={{
                required: config.isMandatory && t("Property Type is required"),
              }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  // selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : BuildingType}
                  selected={props.value}
                  option={getPropertyTypeMenu(proptype)}
                  select={(e) => {
                    props.onChange(e);
                    // selectLocality(e)
                    selectBuildingType(e); // to keep your external state also in sync
                  }}
                  // select={props.onChange}
                  onBlur={props.onBlur}
                  optionKey="i18nKey"
                  t={t}
                  // disable={isEditProperty ? isEditProperty : false}
                />
              )}
            />
          </LabelFieldPair>
          {localFormState?.errors?.PropertyType ? (
            <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
              {localFormState?.errors?.PropertyType?.message}
            </CardLabelError>
          ) : null}
        </React.Fragment>
      );
    });
  }


  if (window.location.href.includes("citizen")) {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment key={index}>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t(input.label)} {config.isMandatory && <span style={{ color: 'red' }}>*</span>}</CardLabel>
            {/* <Dropdown
              className="form-field"
              selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : BuildingType}
              disable={getPropertyTypeMenu(proptype)?.length === 1}
              option={getPropertyTypeMenu(proptype)}
              select={selectBuildingType}
              optionKey="i18nKey"
              onBlur={onBlur}
              t={t}
            /> */}
            <Controller
              name="PropertyType"
              // defaultValue={BuildingType}
              control={control}
              rules={{
                required: config.isMandatory && t("Property Type is required"),
              }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  // selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : BuildingType}
                  selected={props.value}
                  option={getPropertyTypeMenu(proptype)}
                  select={(e) => {
                    props.onChange(e);
                    // selectLocality(e)
                    selectBuildingType(e); // to keep your external state also in sync
                  }}
                  // select={props.onChange}
                  onBlur={props.onBlur}
                  optionKey="i18nKey"
                  t={t}
                  // disable={isEditProperty ? isEditProperty : false}
                />
              )}
            />
          </LabelFieldPair>
          {localFormState?.errors?.PropertyType ? (
            <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
              {localFormState?.errors?.PropertyType?.message}
            </CardLabelError>
          ) : null}
        </React.Fragment>
      );
    });
  }
  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}
      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={!BuildingType}>
        <RadioButtons
          t={t}
          optionsKey="i18nKey"
          isMandatory={config.isMandatory}
          //options={menu}
          options={getPropertyTypeMenu(proptype) || {}}
          selectedOption={BuildingType}
          onSelect={selectBuildingType}
        />
      </FormStep>
      {<CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t("PT_PROPERTY_TYPE_INFO_MSG")} />}
    </React.Fragment>
  );
};
export default PropertyType;
