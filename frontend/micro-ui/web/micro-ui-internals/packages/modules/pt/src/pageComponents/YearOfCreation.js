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
import { useForm, Controller } from "react-hook-form"
import Timeline from "../components/TLTimeline";

const YearOfCreation = ({ t, config, onSelect, userType, formData, setError, clearErrors, formState, onBlur }) => {
  const [BuildingType, setBuildingType] = useState("");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const { data: Menu = {}, isLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "PTPropertyType") || {};
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
  console.log("formdata in yoc",formData)
  const [selectedValue, setSelectedValue] = useState(()=>{
    if(window.location.href.includes("employee")){
      return formData?.yearOfCreation || ""
    }
    else if(window.location.href.includes("citizen") && window.location.href.includes("edit-application")){
      return formData?.yearOfCreation || ""
    }
    else{
      return formData?.yearOfCreation?.yearOfCreation || ""
    }
  });
  console.log("Our menu---", Menu);
  const formValue = watch();
  const { errors } = localFormState;
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
  let proptype = [];
  proptype = Menu?.PropertyTax?.PropertyType;
  let i;
  let menu = [];
  console.log("menu : ", Menu);

  useEffect(() => {
    onSelect(config.key, selectedValue);
  }, [selectedValue]);

  const onChange = (e) => {
    setSelectedValue(e);
  }
  const { data: FinancialYearData } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "egf-master", [{ name: "FinancialYear" }], {
    select: (data) => {
      const formattedData = data?.["egf-master"]?.["FinancialYear"];

      return formattedData;
    },
  });

  let FinancialYearOptions = [];
  const currentYear = new Date().getFullYear();
  const seenYears = new Set();
  FinancialYearData &&
    FinancialYearData.forEach((item) => {
      const year = parseInt(item.name); // Assuming `item.name` contains the year as a string
      if (year <= currentYear && !seenYears.has(year)) { // Check if the year is unique
        seenYears.add(year); // Add the year to the Set
        FinancialYearOptions.push({ i18nKey: `${item.name}`, code: `${item.code}`, value: `${item.name}` });
      }
    })
  FinancialYearOptions.sort((a, b) => parseInt(a.value) - parseInt(b.value));
  console.log("FinancialYearOptions", FinancialYearOptions);
  // FinancialYearData.map((item) => {
  //   FinancialYearOptions.push({ i18nKey: `${item.name}`, code: `${item.code}`, value: `${item.name}` });
  // });
  function getPropertyTypeMenu(proptype) {
    if ( window.location.href.includes("employee")) {
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


  console.log("menu : ", menu);
  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify");

  const onSkip = () => onSelect();

  function selectBuildingType(value) {
    setBuildingType(value);
  }

  function goNext() {
    sessionStorage.setItem("PropertyType", BuildingType?.i18nKey);
    onSelect(config.key, BuildingType);
  }

  useEffect(() => {
    if (presentInModifyApplication &&  window.location.href.includes("employee") && Menu) {
      const original = formData?.originalData?.propertyType;
      const defaultVal = getPropertyTypeMenu(proptype)?.filter((e) => e.code === original)[0];
      setBuildingType(defaultVal);
    }
  }, [isLoading]);

  useEffect(() => {
    if ( window.location.href.includes("employee")) {
      goNext();
      if (!BuildingType) setError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
      else clearErrors(config.key);
    }
  }, [BuildingType]);

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
  

  const inputs = [
    {
      label: "Year of Creation",
      type: "text",
      name: "yearOfCreation",
      validation: {},
    },
  ];

  if (isLoading) {
    return <Loader />;
  }
  console.log("localFormState",localFormState?.errors)
  if ( window.location.href.includes("employee")) {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment key={index}>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t(input.label)} {config.isMandatory && <span style={{ color: "red" }}>*</span>}</CardLabel>
            <Controller
              name={config.key}
              control={control}
              defaultValue={selectedValue}
              rules={{ required: config.isMandatory ? t("REQUIRED_FIELD") : false }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  selected={selectedValue}
                  option={FinancialYearOptions}
                  errorStyle={localFormState.touched.tradeSubType && errors?.tradeSubType?.message ? true : false}
                  select={(e) => {
                    props.onChange(e);
                    onChange(e);
                  }}
                  optionKey="i18nKey"
                  onBlur={props.onBlur}
                  t={t}
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
    });
  }
  if ( window.location.href.includes("citizen")) {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment key={index}>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t(input.label)} {config.isMandatory && <span style={{ color: "red" }}>*</span>}</CardLabel>
            <Controller
              name={config.key}
              control={control}
              defaultValue={selectedValue}
              rules={{ required: config.isMandatory ? t("REQUIRED_FIELD") : false }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  selected={selectedValue}
                  option={FinancialYearOptions}
                 // errorStyle={localFormState?.errors?.yearOfCreation && errors?.yearOfCreation?.message ? true : false}
                  select={(e) => {
                    props.onChange(e);
                    onChange(e);
                  }}
                  optionKey="i18nKey"
                  onBlur={props.onBlur}
                  t={t}
                />
              )}
            />
          </LabelFieldPair>
          {localFormState?.errors?.yearOfCreation ? (
            <CardLabelError style={errorStyle}>
              {errors?.["yearOfCreation"]?.message}
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
export default YearOfCreation;
