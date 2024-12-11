import { CardLabel,LabelFieldPair, TextInput, CardLabelError } from "@upyog/digit-ui-react-components";
//import  FormStep  from "@upyog/digit-ui-react-components/src/molecules/FormStep";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
//import Timeline from "../components/TLTimeline";

const ExistingPropertyId= ({ t, config, onSelect, value, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState, onBlur }) => {
  //let index = window.location.href.charAt(window.location.href.length - 1);
  let index = window.location.href.split("/").pop();
  let validation = {};
  const onSkip = () => onSelect();

   let existingPropertyId;
   let setExistingPropertyId;
  const [hidden, setHidden] = useState(true);
  if (!isNaN(index)) {
    [existingPropertyId, setExistingPropertyId] = useState(formData?.existingPropertyId || "");
  } else {
    [existingPropertyId, setExistingPropertyId] = useState(formData?.existingPropertyId || "");
  }
  const [error, setError] = useState(null);
  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify");
  useEffect(() => {
    validateExistingPropertyId();
  }, [existingPropertyId])

  const onChange=(e)=> {
    setExistingPropertyId(e.target.value);//
    validateExistingPropertyId();
  }

  //}
  const goNext=()=> {
    sessionStorage.setItem("existingPropertyId", existingPropertyId.i18nKey);
    onSelect("existingPropertyId", { existingPropertyId });
  };


  useEffect(() => {
    if (userType === "employee") {
    if(existingPropertyId !== "undefined" && existingPropertyId?.length === 0){
        //setFormError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
    }else clearFormErrors(config.key);

      onSelect(config.key, existingPropertyId);
    }
  }, [existingPropertyId]);

  useEffect(() => {
    if (presentInModifyApplication && userType === "employee") {
        setExistingPropertyId(formData?.originalData?.existingPropertyId)
    }
  }, []);

  const inputs = [
    {
      label: "PT_EXISTING_PROPERTY_ID_LABEL",
      type: "text",
      name: "existingPropertyId",
      // isMandatory : "true",
      //  validation: {
      //    required: true,
      //    minLength: 1,
      //  }
    },


  ];
  const validateExistingPropertyId=()=>{
    if (existingPropertyId === ""){
        // setError("Please Enter Existing Property Id")
    }
    
  };
  const handleExistingPropertyIdChange=(e)=>{
    
    onChange(e);
  }

  if (userType === "employee") {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment>
          <LabelFieldPair key={index}>
            <CardLabel className="card-label-smaller">{t(input.label)}</CardLabel>
            <div className="field">

              <TextInput
                key={input.name}
                id={input.name}
                //isMandatory={config.isMandatory}
                value={existingPropertyId}
                onChange={handleExistingPropertyIdChange}
                //onChange={setElectricityNo}
                onSelect={goNext}
                placeholder={""}
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
    <div>ExistingPropertyId</div>

     
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

export default ExistingPropertyId;