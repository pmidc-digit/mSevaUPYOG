import { CardLabel,LabelFieldPair, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";
//import  FormStep  from "@mseva/digit-ui-react-components/src/molecules/FormStep";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
//import Timeline from "../components/TLTimeline";
import { Controller, useForm } from "react-hook-form";

const Remarks = ({ t, config, onSelect, value, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState, onBlur }) => {
  //let index = window.location.href.charAt(window.location.href.length - 1);

console.log("formdata testing==",formData);


  let index = window.location.href.split("/").pop();
  let validation = {};
  const onSkip = () => onSelect();
const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue, trigger } = useForm();
   let remarks;
   let setRemarks;
  const [hidden, setHidden] = useState(true);
  if (!isNaN(index)) {
    [remarks, setRemarks] = useState(formData?.remarks || ""); formData.remarks
  } else {
    [remarks, setRemarks] = useState(formData?.remarks || "");
  }
  const [error, setError] = useState(null);
  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify")|| pathname.includes("edit");
  useEffect(() => {
    validateRemarks();
  }, [remarks])

  const handleRemarksChange=(value)=> {
    setRemarks(value);//
    onSelect(config.key, {...formData[config.key], remark: value })
    validateRemarks();
  }

  //}
  const goNext=()=> {
    sessionStorage.setItem("remarks", remarks.i18nKey);
    onSelect("remarks", { remarks });
  };


  useEffect(() => {
    if (userType === "employee") {
    if(remarks !== "undefined" && remarks?.length === 0){
        //setFormError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
    }else clearFormErrors(config.key);

      onSelect(config.key, remarks);
    }
  }, [remarks]);

  useEffect(() => {

      setRemarks(formData?.remarks)
    
    setValue("remark",remarks);
  }, [formData,remarks]);

  const inputs = [
    {
      label: "PT_REMARKS_LABEL",
      type: "text",
      name: "remarks",
      // isMandatory : "true",
      //  validation: {
      //    required: true,
      //    minLength: 1,
      //  }
    },


  ];
  const validateRemarks=()=>{
    if (remarks === ""){
        setError("Please Enter Remarks")
    }
    
  };
  // const handleRemarksChange=(e)=>{
    
  //   onChange(e);
  // }

  if (userType === "employee") {
    return inputs?.map((input, index) => {
      return (
        <React.Fragment>
          <LabelFieldPair key={index}>
            <CardLabel className="card-label-smaller">{t(input.label)}</CardLabel>
            <div className="field">

              {/* <TextInput
                key={input.name}
                id={input.name}
                //isMandatory={config.isMandatory}
                value={remarks}
                onChange={handleRemarksChange}
                //onChange={setElectricityNo}
                onSelect={goNext}
                placeholder={""}
                {...input.validation}
                onBlur={onBlur}

              // autoFocus={presentInModifyApplication}
              /> */}
              <Controller
              control={control}
              defaultValue={remarks}
              name="remark"
              render={(_props) => (
                <TextInput
                  id="remark"
                  value={remarks}
                  onChange={(e) => {
                    handleRemarksChange(e.target.value);
                    _props.onChange(e.target.value);
                  }}
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
  return (
    <React.Fragment>
    <div>Remarks</div>

     
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

export default Remarks;