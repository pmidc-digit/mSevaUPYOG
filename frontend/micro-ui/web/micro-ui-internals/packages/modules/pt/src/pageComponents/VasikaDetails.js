import { CardLabel, FormStep, LabelFieldPair, TextInput ,CardLabelError, DatePicker} from "@mseva/digit-ui-react-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
//import Timeline from "../components/TLTimeline";

const VasikaDetails = ({ t, config, onSelect, userType, formData, formState, setError, clearErrors }) => {
  const onSkip = () => onSelect();
  const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });

  const[vasikaNo, setVasikaNo]=useState(formData?.additionalDetails?.vasikaNo || "")
  const [vasikaDate,setVasikaDate]=useState(formData?.additionalDetails?.vasikaDate || "")
  
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, trigger } = useForm();
  const formValue = watch();
  const { errors } = localFormState;
  const checkLocation = window.location.href.includes("pt/new-application") || window.location.href.includes("pt/renew-application-details");
  const isRenewal = window.location.href.includes("edit-application") || window.location.href.includes("pt/renew-application-details");
  let validation = {};
 
  let inputs = [
    {
      label: "PT_PROPERTY_ADDRESS_VASIKA_NO",
      type: "text",
      name: "vasikaNo",
      //isMandatory:"true",
      // validation: {
      //   pattern: "[a-zA-Z0-9 !@#$%^&*()_+\-={};':\\\\|,.<>/?]{1,64}",
      //   isRequired: true,
      //   title: t("CORE_COMMON_DOOR_INVALID"),
      // },
    },
    {
      label: "PT_PROPERTY_ADDRESS_VASIKA_DATE",
      type: "date",
      name: "vasikaDate",
      // isMandatory:"true",
      // validation: {
      //   pattern: "[a-zA-Z0-9 !@#$%^&*()_+\-={};':\\\\|,.<>/?]{1,64}",
      //   isRequired: true,
      //   title: t("CORE_COMMON_STREET_INVALID"),
      // },
    },
    
  ];

  const convertValidationToRules = ({ validation, name, messages }) => {
    if (validation) {
      let { pattern: valPattern, maxlength, minlength, required: valReq } = validation || {};
     
      let pattern = (value) => {
        if (valPattern) {
          if (valPattern instanceof RegExp) return valPattern.test(value) ? true : messages?.pattern || `${name.toUpperCase()}_PATTERN`;
          else if (typeof valPattern === "string")
            return new RegExp(valPattern)?.test(value) ? true : messages?.pattern || `${name.toUpperCase()}_PATTERN`;
        }
        return true;
      };
      let maxLength = (value) => (maxlength ? (value?.length <= maxlength ? true : messages?.maxlength || `${name.toUpperCase()}_MAXLENGTH`) : true);
      let minLength = (value) => (minlength ? (value?.length >= minlength ? true : messages?.minlength || `${name.toUpperCase()}_MINLENGTH`) : true);
      let required = (value) => (valReq ? (!!value ? true : messages?.required || `${name.toUpperCase()}_REQUIRED`) : true);
      return { pattern, required, minLength, maxLength };
    }
    return {};
  };
const setData=(config,data)=>{
  let dataNew ={vasikaNo,vasikaDate}
  onSelect(config, dataNew)
}
  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    if (userType === "employee") {
      if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) setError(config.key, { type: errors });
      else if (!Object.keys(errors).length && formState.errors[config.key]) clearErrors(config.key);
    }
  }, [errors]);

  useEffect(() => {
    const keys = Object.keys(formValue);
    const part = {};
    keys.forEach((key) => (part[key] = formData[config.key]?.[key]));
    console.log("key",formValue)
    if (!_.isEqual(formValue, part)) {
      onSelect(config.key, { ...formData[config.key], ...formValue });
      for (let key in formValue) {
      
        if (!formValue[key] && !localFormState?.errors[key]) {
          setLocalError(key, { type: `${key.toUpperCase()}_REQUIRED`, message: t(`CORE_COMMON_REQUIRED_ERRMSG`) });
        } else if (formValue[key] && localFormState.errors[key]) {
          clearLocalErrors([key]);
        }
      }
      trigger();
    } 
    console.log("formValue",formValue,formData)
  }, [formValue]);
  function selectVasikaNo(e) {
    setFocusIndex({ index:0});
    setStreet(e.target.value);
  }
  function selectVasikaDate(e) {
    setFocusIndex({ index:1 });
    setVasikaDate(e.target.value);
  }


  if (userType === "employee") {

      return (
        <div>
        <LabelFieldPair key={0}>
          <CardLabel className="card-label-smaller">
            {`${t(inputs[0].label)}`}
            {config.isMandatory ? " *" : ""}
          </CardLabel>
          <div className="field">
            <Controller
              control={control}
              defaultValue={formData?.additionalDetails?.[inputs[0].name]}
              name={inputs[0].name}
              rules={{ validate: convertValidationToRules(inputs[0]) }}
              type={"text"}
              render={(_props) => (
                
                <TextInput
                  id={inputs[0].name}
                  key={inputs[0].name}
                  value={_props.value}
                  type={"text"}
                  onChange={(e) => {
                    setFocusIndex({ index:0  });
                    _props.onChange(e.target.value);
                  }}
                  onBlur={_props.onBlur}
                  disable={isRenewal}
                  autoFocus={focusIndex?.index == 0}
                  {...inputs[0].validation}
                />
                
         
              )}
            />
           
          </div>
        </LabelFieldPair>
        {formState.touched[config.key] ? (
            <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
              {formState.errors?.[config.key]?.message}
            </CardLabelError>
          ) : null}

        <LabelFieldPair key={1}>
          <CardLabel className="card-label-smaller">
            {`${t(inputs[1].label)}`}
            {config.isMandatory ? " * " : ""}
          </CardLabel>
          <div className="field">
            <Controller
              control={control}
              defaultValue={formData?.additionalDetails?.[inputs[1].name]}
              name={inputs[1].name}
              //rules={{ validate: convertValidationToRules(inputs[1]) }}
              type={"date"}
              render={(_props) => (
                <DatePicker
                    date={_props.value} 
                    name="VasikaDate"
                    onChange={(e) => {
                        setFocusIndex({ index:1 });
                        _props.onChange(e);
                    }}
                    disabled={isRenewal}
                  />                 
              )}
            />
          </div>
        </LabelFieldPair>
        {formState.touched[config.key] ? (
            <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
              {formState.errors?.[config.key]?.message}
            </CardLabelError>
          ) : null}

        </div>
      );

  }
  return (
    <React.Fragment>
    {/* {window.location.href.includes("/citizen") ? <Timeline currentStep={1}/> : null}
    <FormStep
      config={{ ...config }}
      onSelect={(data) => {setData(config.key,data)}}
      onSkip={onSkip}
      isDisabled={street =="" || doorNo ==""}
      t={t}
    >
        <CardLabel>{`${t("PT_PROPERTY_ADDRESS_STREET_NAME")}*`}</CardLabel>
          <TextInput
            t={t}
            //isMandatory={true}
            type={"text"}
            optionKey="i18nKey"
            name="street"
            onChange={selectVasikaNo}
            value={street}
            errorStyle={true}
            autoFocus={focusIndex?.index == 1}
          />

         <CardLabel>{`${t("PT_PROPERTY_ADDRESS_BUILD/COLONY_NAME")}*`}</CardLabel>
          <TextInput
            t={t}
            //isMandatory={true}
            type={"text"}
            optionKey="i18nKey"
            name="buildingNo"
            onChange={selectVasikaDate}
            value={buildingNo}
            errorStyle={true}
            autoFocus={focusIndex?.index == 1}
          />


      <CardLabel>{`${t("PT_PROPERTY_ADDRESS_HOUSE_NO")}*`}</CardLabel>
          <TextInput
            t={t}
            //isMandatory={true}
            type={"text"}
            optionKey="i18nKey"
            name="doorNo"
            onChange={selectDoorNo}
            value={doorNo}
            errorStyle={false}
            autoFocus={focusIndex?.index == 1}
           
          />
      </FormStep> */}
    </React.Fragment>
  );
};

export default VasikaDetails;
