import { CardLabel,LabelFieldPair, TextInput, CardLabelError } from "@upyog/digit-ui-react-components";
//import  FormStep  from "@upyog/digit-ui-react-components/src/molecules/FormStep";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
//import Timeline from "../components/TLTimeline";

const BusinessName = ({ t, config, onSelect, value, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState, onBlur }) => {
  //let index = window.location.href.charAt(window.location.href.length - 1);
  let index = window.location.href.split("/").pop();
  let validation = {};
  const onSkip = () => onSelect();

  let businessName;
  let setBusinessName;
  const [hidden, setHidden] = useState(true);
  if (!isNaN(index)) {
    [businessName, setBusinessName] = useState(formData?.originalData?.additionalDetails?.businessName || "");
  } else {
    [businessName, setBusinessName] = useState(formData?.originalData?.additionalDetails?.businessName || "");
  }
  const [error, setError] = useState(null);
  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify");
  useEffect(() => {
    validateBusinessName();
  }, [businessName])

  const onChange=(e)=> {
    setBusinessName(e.target.value);//
    validateBusinessName();
  }

  //}
  const goNext=()=> {
    sessionStorage.setItem("businessName", businessName.i18nKey);
    onSelect("businessName", { businessName });
  };


  useEffect(() => {
    if (userType === "employee") {
    //console.log("configkeyEEE", config.key)
    //    if (remarks !== "undefined" && remarks?.length === 0) setFormError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
    //    else if (remarks !== "undefined" && remarks?.length < 10 || remarks?.length > 10 || !Number(remarks)) setFormError(config.key, { type: "invalid", message: t("ERR_DEFAULT_INPUT_FIELD_MSG") });
    if(businessName !== "undefined" && businessName?.length === 0){
        setFormError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
    }else clearFormErrors(config.key);

      onSelect(config.key, businessName);
    }
  }, [businessName]);

  useEffect(() => {
    if (presentInModifyApplication && userType === "employee") {
      setBusinessName(formData?.originalData?.additionalDetails?.businessName)
    }
  }, []);

  const inputs = [
    {
      label: "PT_BUSINESS_NAME_LABEL",
      type: "text",
      name: "businessName",
      isMandatory : "true",
       validation: {
         required: true,
         minLength: 1,
       }
    },


  ];
  const validateBusinessName=()=>{
    //  if(new RegExp(/^\d{10}$/).test(electricity) || electricity===""){
    //    setError("");
    //  }

    if (businessName === ""){
        setError("Please Enter Business Name")
    }
    
  };
  const handleBusinessNameChange=(e)=>{
    const value=e.target.value;
    //   if(new RegExp(/^\d{0,10}$/).test(value)|| value===""){
    //     onChange(e);
    //     validateRemarks();
    //   }
    //   else{
    //     setError("Remarks number should contain only 10 digits");
    //   }
    onChange(e);
  }

  if (userType === "employee") {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment>
          <LabelFieldPair key={index}>
            <CardLabel className="card-label-smaller">{t(input.label) + "  *"}</CardLabel>
            <div className="field">

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