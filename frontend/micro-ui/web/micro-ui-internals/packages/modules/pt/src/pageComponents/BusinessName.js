import { CardLabel, LabelFieldPair, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";
//import  FormStep  from "@mseva/digit-ui-react-components/src/molecules/FormStep";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
//import Timeline from "../components/TLTimeline";
import { Controller, useForm } from "react-hook-form";

const BusinessName = ({ t, config, onSelect, value, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState, onBlur }) => {
  //let index = window.location.href.charAt(window.location.href.length - 1);
  let index = window.location.href.split("/").pop();

  console.log("formdata testing==", formData);

  let validation = {};
  const onSkip = () => onSelect();
  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, trigger } = useForm();
  let businessName;
  let setBusinessName;
  const [hidden, setHidden] = useState(true);
  // if (!isNaN(index)) {
  //   [businessName, setBusinessName] = useState(formData?.businessName?.bussinessName || "");
  // } else {
  //   [businessName, setBusinessName] = useState(formData?.businessName?.bussinessName || "");
  // }
  if (window.location.href.includes("employee")) {
    [businessName, setBusinessName] = useState(formData?.businessName || "");
  // }else if( window.location.href.includes("citizen") && window.location.href.includes("edit-application")) {
  //   [businessName, setBusinessName] = useState(formData?.businessName || "");
  }
   else {
    [businessName, setBusinessName] = useState(formData?.businessName?.businessName || "");
  }
  const formValue = watch();
  console.log("businessName",businessName)
  const { errors } = localFormState;
  
  const [error, setError] = useState(null);
  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify");
  useEffect(() => {
    validateBusinessName();
  }, [businessName])

  const handleBusinessNameChange = (value) => {
    console.log("valuehandleBusinessNameChange", value)
    setBusinessName(value);
    onSelect(config.key, { ...formData[config.key], businessName: value })
    validateBusinessName();
  }

  //}
  const goNext = () => {
    sessionStorage.setItem("businessName", businessName.i18nKey);
    onSelect("businessName", { businessName });
  };


  useEffect(() => {
    if ( window.location.href.includes("employee")) {
      //console.log("configkeyEEE", config.key)
      //    if (remarks !== "undefined" && remarks?.length === 0) setFormError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
      //    else if (remarks !== "undefined" && remarks?.length < 10 || remarks?.length > 10 || !Number(remarks)) setFormError(config.key, { type: "invalid", message: t("ERR_DEFAULT_INPUT_FIELD_MSG") });
      if (businessName !== "undefined" && businessName?.length === 0) {
        setFormError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
      } else clearFormErrors(config.key);

      onSelect(config.key, businessName);
    }
  }, [businessName]);

  useEffect(() => {
    if (presentInModifyApplication &&  (window.location.href.includes("employee")|| window.location.href.includes("citizen"))) {
      setBusinessName(formData?.businessName)
    }
  }, []);

  const inputs = [
    {
      label: "PT_BUSINESS_NAME_LABEL",
      type: "text",
      name: "businessName",
      isMandatory: "true",
      validation: {
        // isRequired: config.isMandatory,
        minLength: 1,
      }
    },


  ];
  const validateBusinessName = () => {
    //  if(new RegExp(/^\d{10}$/).test(electricity) || electricity===""){
    //    setError("");
    //  }

    if (businessName === "") {
      setError("Please Enter Business Name")
    }

  };
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
  console.log("localFormState",localFormState?.errors)
  // const handleBusinessNameChange=(e)=>{
  //   const value=e.target.value;
  //   //   if(new RegExp(/^\d{0,10}$/).test(value)|| value===""){
  //   //     onChange(e);
  //   //     validateRemarks();
  //   //   }
  //   //   else{
  //   //     setError("Remarks number should contain only 10 digits");
  //   //   }
  //   onChange(e);
  // }

  if ( window.location.href.includes("employee")) {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment>
          <LabelFieldPair key={index}>
            <CardLabel className="card-label-smaller">{t(input.label)} {config.isMandatory && <span style={{ color: 'red' }}>*</span>}</CardLabel>
            <div className="field">
              {/* 
              <TextInput
                key={input.name}
                id={input.name}
                //isMandatory={config.isMandatory}
                value={businessName}
                onChange={handleBusinessNameChange}
                //onChange={setElectricityNo}
                onSelect={goNext}
                //placeholder={"Enter valid business name"}
                {...input.validation}
                onBlur={onBlur}

              // autoFocus={presentInModifyApplication}
              /> */}
              <Controller
                control={control}
                defaultValue={businessName}
                name="businessName"
                rules={{
                  // required: config.isMandatory && t("Business Name is required"),
                }}
                render={(_props) => (
                  <TextInput
                    id="businessName"
                    value={businessName}
                    onChange={(e) => {
                      handleBusinessNameChange(e.target.value);
                      _props.onChange(e.target.value);
                    }}
                    {...input.validation}
                  // onBlur={_props.onBlur}
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
        </React.Fragment>
      );
    });
  }
  if ( window.location.href.includes("citizen")) {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment>
          <LabelFieldPair key={index}>
            <CardLabel className="card-label-smaller">{t(input.label)} {config.isMandatory && <span style={{ color: 'red' }}>*</span>}</CardLabel>
            <div className="field">
              {/* 
              <TextInput
                key={input.name}
                id={input.name}
                //isMandatory={config.isMandatory}
                value={businessName}
                onChange={handleBusinessNameChange}
                //onChange={setElectricityNo}
                onSelect={goNext}
                //placeholder={"Enter valid business name"}
                {...input.validation}
                onBlur={onBlur}

              // autoFocus={presentInModifyApplication}
              /> */}
              <Controller
                control={control}
                defaultValue={businessName}
                name="businessName"
                rules={{
                  // required: config.isMandatory && t("Business Name is required"),
                }}
                render={(_props) => (
                  <TextInput
                    id="businessName"
                    value={businessName}
                    onChange={(e) => {
                      handleBusinessNameChange(e.target.value);
                      _props.onChange(e.target.value);
                    }}
                    {...input.validation}
                  // onBlur={_props.onBlur}
                  />
                )}
              />

            </div>
          </LabelFieldPair>
          {localFormState?.errors?.bussinessName ? (
            <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
              {localFormState?.errors?.bussinessName?.message}
            </CardLabelError>
          ) : null}
        </React.Fragment>
      );
    });
  }
  return (
    <React.Fragment>
      <div>BusinessName</div>


      {/* {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}
      
      <FormStep
        config={config}
        onChange={handleRemarksChange}
        defaultValue={formData?.remarks?.remarks}
        onSelect={goNext}
        onSkip={onSkip}
        t={t}
        isDisabled={remarks.length===10 || formData?.remarks?.remarks? false: true}
        showErrorBelowChildren={true}
      >
        <CardLabel>{`${t("PT_ELECTRICITY")}`}</CardLabel>
        <TextInput
          t={t}
          type={"number"}
          isMandatory={false}
          optionKey="i18nKey"
          name="remarks"
          value={remarks || formData?.remarks?.remarks}
          onChange={handleElectricityChange}
          placeholder={"Enter a valid 10-digit remarks number"}
          {...(validation = {
            required: true,
            minLength: 10,
            maxLength: 10,
          })}
        />
        {error && (
          <CardLabelError>{error}</CardLabelError> 
        )}
      </FormStep>
       */}
    </React.Fragment>
  );



};

export default BusinessName;