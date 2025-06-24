import React, { useState, useEffect } from "react";
import {
  FormStep,
  RadioButtons,
  CitizenInfoLabel,
  LabelFieldPair,
  CardLabel,
  Dropdown,
  CardLabelError,
} from "@mseva/digit-ui-react-components";
import { cardBodyStyle } from "../utils";
import { useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";

const PropertyUsageType = ({ t, config, onSelect, userType, formData, formState, setError, clearErrors, onBlur }) => {
  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("edit-application");
  const [usageCategoryMajor, setPropertyPurpose] = useState(
    () => 
    {
      if(!presentInModifyApplication)
      return formData?.usageCategoryMajor && formData?.usageCategoryMajor?.code === "NONRESIDENTIAL.OTHERS"
      ? { code: `${formData?.usageCategoryMajor?.code}`, i18nKey: `PROPERTYTAX_BILLING_SLAB_OTHERS` }
      : formData?.usageCategoryMajor}
  );
  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue } = useForm();
  const stateId = Digit.ULBService.getStateId();

  const { errors } = localFormState;
  const { data: Menu = {}, isLoading: menuLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "UsageCategory") || {};
  console.log("EmployeeSideEditProperty", formData, Menu?.PropertyTax?.UsageCategory);
  let usagecat = [];
  usagecat = Menu?.PropertyTax?.UsageCategory || [];
  let i;
  let menu = [];
  const formValue = watch();
  const isUserEmployee = window.location.href.includes("employee");
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
  function usageCategoryMajorMenu(usagecat) {
    if (window.location.href.includes("employee") || window.location.href.includes("citizen")) {
      const catMenu = usagecat
        ?.filter((e) => e?.code.split(".").length <= 2 && e.code !== "NONRESIDENTIAL")
        ?.map((item) => {
          const arr = item?.code.split(".");
          if (arr.length == 2) return { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + arr[1], code: item?.code };
          else return { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + item?.code, code: item?.code };
        });
      return catMenu;
    } else {
      for (i = 0; i < 10; i++) {
        if (
          Array.isArray(usagecat) &&
          usagecat.length > 0 &&
          usagecat[i].code.split(".")[0] == "NONRESIDENTIAL" &&
          usagecat[i].code.split(".").length == 2
        ) {
          menu.push({ i18nKey: "PROPERTYTAX_BILLING_SLAB_" + usagecat[i].code.split(".")[1], code: usagecat[i].code });
        }
      }
      return menu;
    }
  }

  useEffect(() => {
    if (!menuLoading && presentInModifyApplication) {
      const original = formData?.usageCategoryMajor?.code;
      const selectedOption = usageCategoryMajorMenu(usagecat).filter((e) => e.code === original)[0];
      console.log("EmployeeSideEditProperty orignal", formData?.usageCategoryMajor)
      setPropertyPurpose(selectedOption);
    }
  }, [Menu]);
  // pt.PTNewApplicationForm.formData.PropertyDetails.usageCategoryMajor
  // useEffect(() => {
  //   if (formData?.PropertyDetails?.usageCategoryMajor?.code && usageCategoryMajorMenu(usagecat)?.length) {
  //     const code = formData?.PropertyDetails?.usageCategoryMajor?.code;
  //     const Majorbuiltdingtype = usageCategoryMajorMenu(usagecat)?.find((e) => e.code === code);
  //     setValue("MajorPropertyType", Majorbuiltdingtype);
  //   }
  // }, [formData, usageCategoryMajor]);
  // useEffect(() => {

  //   console.log("code is coming innn ")
  //   if (formData?.PropertyDetails?.usageCategoryMajor?.code || usageCategoryMajorMenu(usagecat)?.length) {
  //     const code = formData?.PropertyDetails?.usageCategoryMajor?.code;
  //     console.log("here is code -in if's",code)
  //     const Majorbuiltdingtype = usageCategoryMajorMenu(usagecat)?.find((e) => e.code === code);
  //     console.log("code in Majorbuiltdingtype",Majorbuiltdingtype)
  //     setValue("MajorPropertyType", Majorbuiltdingtype);
  //     // setPropertyPurpose(Majorbuiltdingtype)
  //   }
  //   console.log("code is out ")
  // }, [formData, usageCategoryMajor  ]);

  // useEffect(() => {

  //   console.log("code is coming innn ")
  //   if (formData?.usageCategoryMajor?.code || usageCategoryMajorMenu(usagecat)?.length) {
  //     const code = formData?.usageCategoryMajor?.code;
  //     console.log("here is code -in if's",code)
  //     const Majorbuiltdingtype = usageCategoryMajorMenu(usagecat)?.find((e) => e.code === code);
  //     console.log("code in Majorbuiltdingtype",Majorbuiltdingtype)
  //     setValue("PropertyUsageType", Majorbuiltdingtype);
  //     // setPropertyPurpose(Majorbuiltdingtype)
  //   }
  //   console.log("code is out ")
  // }, [formData]);

  const onSkip = () => onSelect();

  /* useEffect(() => {
    if (userType !== "employee" && formData?.isResdential?.i18nKey === "PT_COMMON_YES" && formData?.usageCategoryMajor?.i18nKey !== "RESIDENTIAL") {
      //selectPropertyPurpose({i18nKey : "RESIDENTAL"})
      onSelect(config.key, { i18nKey: "PROPERTYTAX_BILLING_SLAB_RESIDENTIAL" }, true);
    }
  }, [formData?.usageCategoryMajor?.i18nKey]); */

  function selectPropertyPurpose(value) {
    setPropertyPurpose(value);

    if (value?.i18nKey === "PROPERTYTAX_BILLING_SLAB_OTHERS") {
    value.i18nKey = "PROPERTYTAX_BILLING_SLAB_NONRESIDENTIAL";
    onSelect(config.key, value);
  } else {
    onSelect(config.key, value);
  }
  }

  function goNext() {
    if (usageCategoryMajor?.i18nKey === "PROPERTYTAX_BILLING_SLAB_OTHERS") {
      usageCategoryMajor.i18nKey = "PROPERTYTAX_BILLING_SLAB_NONRESIDENTIAL";
      onSelect(config.key, usageCategoryMajor);
    } else {
      onSelect(config.key, usageCategoryMajor);
    }
    // onSelect(config.key,ResidentialType, false, index);
  }

  useEffect(() => {
    if (window.location.href.includes("employee") || window.location.href.includes("citizen")) {
      if (!usageCategoryMajor) {
        setError(config.key, { type: "required", message: t(`CORE_COMMON_REQUIRED_ERRMSG`) });
      } else {
        clearErrors(config.key);
      }
      goNext();
    }
  }, [usageCategoryMajor]);
  console.log("form state", formState);
  console.log("localFormState", localFormState?.errors);
  if (window.location.href.includes("employee")) {
    return (
      <React.Fragment>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t("PT_ASSESMENT_INFO_USAGE_TYPE")} {config.isMandatory && <span style={{ color: "red" }}>*</span>}
          </CardLabel>
          <Controller
            name={config.key}
            // defaultValue={usageCategoryMajor}
            control={control}
            rules={{
              required: config.isMandatory && t("Property Usage Type is required"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                // selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : BuildingType}
                selected={usageCategoryMajor}
                // selected={usageCategoryMajor}
                option={usageCategoryMajorMenu(usagecat)}
                select={(e) => {
                  // props.onChange(e);
                  selectPropertyPurpose(e); // to keep your external state also in sync
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
        {formState.touched[config.key] ? (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {formState.errors?.[config.key]?.message}
          </CardLabelError>
        ) : null}
      </React.Fragment>
    );
  }
  if (window.location.href.includes("citizen")) {
    return (
      <React.Fragment>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t("PT_ASSESMENT_INFO_USAGE_TYPE")} {config.isMandatory && <span style={{ color: "red" }}>*</span>}
          </CardLabel>
          <Controller
            name={config.key}
            // defaultValue={usageCategoryMajor}
            control={control}
            rules={{
              required: config.isMandatory && t("Property Usage Type is required"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                // selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : BuildingType}
                // selected={props.value}
                selected={usageCategoryMajor}
                option={usageCategoryMajorMenu(usagecat)}
                select={(e) => {
                  // props.onChange(e);
                  selectPropertyPurpose(e); // to keep your external state also in sync
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
        {localFormState.errors?.PropertyUsageType ? (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {localFormState.errors?.PropertyUsageType?.message}
          </CardLabelError>
        ) : null}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}
      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={!usageCategoryMajor}>
        <div>
          <RadioButtons
            t={t}
            optionsKey="i18nKey"
            isMandatory={config.isMandatory}
            //options={menu}
            options={usageCategoryMajorMenu(usagecat) || {}}
            selectedOption={usageCategoryMajor}
            onSelect={selectPropertyPurpose}
          />
        </div>
      </FormStep>
      {<CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t("PT_USAGE_TYPE_INFO_MSG", usageCategoryMajor)} />}
    </React.Fragment>
  );
};

export default PropertyUsageType;